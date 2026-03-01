import { useState, useEffect } from 'react';
import apiClient from '../../../api/apiClient';

const useIvsAndLinesData = () => {
  // State for the patient name text input
  const [patientName, setPatientName] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  // Form states
  const [ivFluid, setIvFluid] = useState('');
  const [rate, setRate] = useState('');
  const [site, setSite] = useState('');
  const [status, setStatus] = useState('');

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
        setRecordId(null);
        return;
      }

      try {
        const response = await apiClient.get(`/ivs-and-lines/patient/${selectedPatientId}`);
        // If there's at least one record, load the most recent one
        if (response.data && response.data.length > 0) {
          const record = response.data[0]; // Assuming one per patient as per requirement
          setIvFluid(record.iv_fluid || '');
          setRate(record.rate || '');
          setSite(record.site || '');
          setStatus(record.status || '');
          setRecordId(record.id);
        } else {
          // Reset form for new patient
          setIvFluid('');
          setRate('');
          setSite('');
          setStatus('');
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

    // Validation: Do not accept empty inputs
    if (!ivFluid.trim() || !rate.trim() || !site.trim() || !status.trim()) {
      throw new Error('All fields are required. Please fill in all the details.');
    }

    setIsSubmitting(true);
    try {
      let response;
      const payload = {
        iv_fluid: ivFluid,
        rate: rate,
        site: site,
        status: status,
      };

      if (recordId) {
        // UPDATE existing record
        response = await apiClient.put(`/ivs-and-lines/${recordId}`, payload);
        setIsSubmitting(false);
        return { action: 'update', data: response.data };
      } else {
        // CREATE new record
        response = await apiClient.post(`/ivs-and-lines/?patient_id=${selectedPatientId}`, payload);
        if (response.status === 201) {
            setRecordId(response.data.id);
        }
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
  };
};

export default useIvsAndLinesData;
