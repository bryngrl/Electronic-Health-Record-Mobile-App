import { useState } from 'react';
import apiClient from '@api/apiClient';

export const useRegistration = () => {
  const [step, setStep] = useState(1);
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
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [contacts, setContacts] = useState([
    { name: '', relationship: '', number: '' },
  ]);
  const [contactErrors, setContactErrors] = useState<string[]>([]);

  const capitalize = (str: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  const formatNameOnBlur = (field: keyof typeof form) => {
    setForm(prev => ({ ...prev, [field]: capitalize(prev[field] as string) }));
  };

  const handleNumberChange = (index: number, val: string) => {
    const numericValue = val.replace(/[^0-9]/g, ''); // Only allow numbers
    const updated = [...contacts];
    updated[index].number = numericValue;
    setContacts(updated);

    // Clear error while typing
    const errors = [...contactErrors];
    errors[index] = '';
    setContactErrors(errors);
  };

  const validateNumberOnBlur = (index: number) => {
    const updated = [...contacts];
    let num = updated[index].number;

    // Logic: If user typed 10 digits starting with 9, add the 0
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

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    const requiredFields = [
      'first_name',
      'middle_name',
      'last_name',
      'birthdate',
      'sex',
      'address',
      'birthplace',
      'religion',
      'ethnicity',
      'chief_complaints',
      'room_no',
      'bed_no',
    ];

    requiredFields.forEach(field => {
      if (!form[field as keyof typeof form]?.toString().trim()) {
        errors[field] = 'This field is required';
      }
    });

    if (form.religion === 'Other' && !form.other_religion.trim()) {
      errors.other_religion = 'Please specify religion';
    }
    if (form.ethnicity === 'Other' && !form.other_ethnicity.trim()) {
      errors.other_ethnicity = 'Please specify ethnicity';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: string[] = [];
    let hasError = false;

    contacts.forEach((contact, index) => {
      if (!contact.name.trim() || !contact.relationship.trim() || !contact.number.trim()) {
        errors[index] = 'All contact fields are required';
        hasError = true;
      } else if (contact.number.length !== 11) {
        errors[index] = 'Number must be 11 digits';
        hasError = true;
      } else {
        errors[index] = '';
      }
    });

    setContactErrors(errors);
    return !hasError;
  };

  const registerPatient = async () => {
    // Explicitly define payload to match FastAPI PatientCreate schema
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
      admission_date: new Date().toISOString().split('T')[0], // Required by backend
      room_no: form.room_no,
      bed_no: form.bed_no,
      contact_name: contacts[0].name,
      contact_relationship: contacts[0].relationship,
      contact_number: contacts[0].number,
      user_id: form.user_id,
      is_active: 1,
    };

    try {
      const response = await apiClient.post('/patient', payload);
      return response;
    } catch (error: any) {
      console.error('Registration error details:', error.response?.data);
      throw error;
    }
  };

  return {
    step,
    setStep,
    form,
    setForm,
    formErrors,
    setFormErrors,
    contacts,
    setContacts,
    contactErrors,
    formatNameOnBlur,
    handleNumberChange,
    validateNumberOnBlur,
    validateStep1,
    validateStep2,
    registerPatient,
    capitalize,
  };
};
