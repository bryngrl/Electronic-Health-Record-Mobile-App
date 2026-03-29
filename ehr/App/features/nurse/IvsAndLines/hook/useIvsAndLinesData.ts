import { useState, useEffect } from 'react';
import apiClient from '@api/apiClient';
import { getDataFromCache, saveDataToCache } from '@App/utils/cdssCache';

const useIvsAndLinesData = () => {
  // State for the patient name text input
  const [patientName, setPatientName] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  // Form states
  const [ivFluid, setIvFluid] = useState('');
  const [rate, setRate] = useState('');
  const [site, setSite] = useState('');
  const [status, setStatus] = useState('');

  const [lastSavedData, setLastSavedData] = useState({
    iv_fluid: '',
    rate: '',
    site: '',
    status: '',
  });

  // Track if we are editing an existing record
  const [recordId, setRecordId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing record when patient is selected
  useEffect(() => {
    const fetchExistingRecord = async () => {
      if (!selectedPatientId) {
        setIvFluid('');
        setRate('');
        setSite('');
        setStatus('');
        setLastSavedData({ iv_fluid: '', rate: '', site: '', status: '' });
        setRecordId(null);
        return;
      }

      try {
        // Check cache first
        const cached = await getDataFromCache('ivs-and-lines', selectedPatientId);
        if (cached) {
          console.log('[IvsAndLines] Returning cached data');
          setIvFluid(cached.iv_fluid);
          setRate(cached.rate);
          setSite(cached.site);
          setStatus(cached.status);
          setLastSavedData(cached);
          if (cached.id) setRecordId(cached.id);
        }

        const response = await apiClient.get(`/ivs-and-lines/patient/${selectedPatientId}`);
        // If there's at least one record, load the most recent one
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const record = response.data[0];
          const initialData = {
            id: record.id,
            iv_fluid: record.iv_fluid || '',
            rate: record.rate || '',
            site: record.site || '',
            status: record.status || '',
          };
          setIvFluid(initialData.iv_fluid);
          setRate(initialData.rate);
          setSite(initialData.site);
          setStatus(initialData.status);
          setLastSavedData(initialData);
          setRecordId(record.id);
          await saveDataToCache('ivs-and-lines', selectedPatientId, initialData);
        } else {
          setIvFluid('');
          setRate('');
          setSite('');
          setStatus('');
          setLastSavedData({ iv_fluid: '', rate: '', site: '', status: '' });
          setRecordId(null);
        }
      } catch (err) {
        console.error('Error fetching existing record:', err);
      }
    };

    fetchExistingRecord();
  }, [selectedPatientId]);

  // Submission function
  const handleSubmit = async () => {
    if (!selectedPatientId) {
      throw new Error('Please select a patient first.');
    }

    setIsSubmitting(true);
    try {
      const sanitize = (val: string) => (val.trim() === '' ? 'N/A' : val);

      const payload = {
        patient_id: selectedPatientId,
        iv_fluid: sanitize(ivFluid),
        rate: sanitize(rate),
        site: sanitize(site),
        status: sanitize(status),
      };

      let response;
      if (recordId) {
        // UPDATE existing record
        response = await apiClient.put(`/ivs-and-lines/${recordId}`, payload);
        setLastSavedData({ ...payload });
        setIsSubmitting(false);
        return { action: 'update', data: response.data };
      } else {
        // CREATE new record
        response = await apiClient.post(`/ivs-and-lines`, payload);
        if (response.data?.id) {
            setRecordId(response.data.id);
        }
        setLastSavedData({ ...payload });
        setIsSubmitting(false);
        return { action: 'create', data: response.data };
      }
    } catch (err: any) {
      console.error('Submit Error:', err);
      const message = err.response?.data?.detail || err.message;
      setIsSubmitting(false);
      throw new Error(message);
    }
  };

  const isModified = 
    ivFluid !== lastSavedData.iv_fluid ||
    rate !== lastSavedData.rate ||
    site !== lastSavedData.site ||
    status !== lastSavedData.status;

  const isDataEntered = [ivFluid, rate, site, status].some(
    v => v && v.trim() !== '' && v !== 'N/A',
  );

  return {
    patientName,
    setPatientName,
    selectedPatientId,
    setSelectedPatientId,
    ivFluid,
    setIvFluid,
    rate,
    setRate,
    site,
    setSite,
    status,
    setStatus,
    handleSubmit,
    isSubmitting,
    recordId,
    isModified,
    isDataEntered,
  };
};

export default useIvsAndLinesData;
