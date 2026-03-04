import { useState, useCallback } from 'react';
import apiClient from '../../../api/apiClient';

export const useEditPatient = (patientId: number) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    birthdate: '',
    age: '',
    sex: '',
    address: '',
    birthplace: '',
    religion: '',
    ethnicity: '',
    other_religion: '',
    other_ethnicity: '',
    chief_complaints: '',
    room_no: '',
    bed_no: '',
    user_id: 1,
    admission_date: '',
  });

  const [contacts, setContacts] = useState([
    { name: '', relationship: '', number: '' },
  ]);
  const [contactErrors, setContactErrors] = useState<string[]>([]);

  const loadPatientData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/patients/${patientId}`);
      const data = response.data;
      
      setForm({
        first_name: data.first_name || '',
        middle_name: data.middle_name || '',
        last_name: data.last_name || '',
        birthdate: data.birthdate || '',
        age: data.age?.toString() || '',
        sex: data.sex || '',
        address: data.address || '',
        birthplace: data.birthplace || '',
        religion: data.religion || '',
        ethnicity: data.ethnicity || '',
        other_religion: '',
        other_ethnicity: '',
        chief_complaints: data.chief_complaints || '',
        room_no: data.room_no || '',
        bed_no: data.bed_no || '',
        user_id: data.user_id || 1,
        admission_date: data.admission_date || '',
      });

      if (data.contact_name) {
        setContacts([
          {
            name: data.contact_name,
            relationship: data.contact_relationship || '',
            number: data.contact_number || '',
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  const capitalize = (str: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  const formatNameOnBlur = (field: keyof typeof form) => {
    setForm(prev => ({ ...prev, [field]: capitalize(prev[field] as string) }));
  };

  const handleNumberChange = (index: number, val: string) => {
    const numericValue = val.replace(/[^0-9]/g, '');
    const updated = [...contacts];
    updated[index].number = numericValue;
    setContacts(updated);

    const errors = [...contactErrors];
    errors[index] = '';
    setContactErrors(errors);
  };

  const validateNumberOnBlur = (index: number) => {
    const updated = [...contacts];
    let num = updated[index].number;

    if (num.length === 10 && num.startsWith('9')) {
      num = '0' + num;
      updated[index].number = num;
      setContacts(updated);
    }

    const errors = [...contactErrors];
    if (num.length > 0 && num.length !== 11) {
      errors[index] = 'Number must be exactly 11 digits (e.g. 0919...)';
    } else {
      errors[index] = '';
    }
    setContactErrors(errors);
  };

  const updatePatient = async () => {
    if (contactErrors.some(e => e !== '')) {
      throw new Error('Please correct the contact number errors.');
    }

    const payload = {
      first_name: form.first_name,
      middle_name: form.middle_name,
      last_name: form.last_name,
      birthdate: form.birthdate || null,
      age: parseInt(form.age, 10) || 0,
      sex: form.sex,
      address: form.address,
      birthplace: form.birthplace,
      religion: form.religion === 'Other' ? form.other_religion : form.religion,
      ethnicity: form.ethnicity === 'Other' ? form.other_ethnicity : form.ethnicity,
      chief_complaints: form.chief_complaints,
      admission_date: form.admission_date || new Date().toISOString().split('T')[0],
      room_no: form.room_no,
      bed_no: form.bed_no,
      contact_name: contacts[0].name,
      contact_relationship: contacts[0].relationship,
      contact_number: contacts[0].number,
      user_id: form.user_id,
      is_active: true,
    };

    try {
      const response = await apiClient.put(`/patients/${patientId}`, payload);
      return response;
    } catch (error: any) {
      console.error('Update error details:', error.response?.data);
      throw error;
    }
  };

  return {
    step,
    setStep,
    form,
    setForm,
    contacts,
    setContacts,
    contactErrors,
    isLoading,
    loadPatientData,
    formatNameOnBlur,
    handleNumberChange,
    validateNumberOnBlur,
    updatePatient,
    capitalize,
  };
};
