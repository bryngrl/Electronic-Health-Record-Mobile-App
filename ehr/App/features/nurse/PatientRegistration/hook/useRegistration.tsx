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

  const [contacts, setContacts] = useState([
    { name: '', relationship: '', number: '' },
  ]);
  const [contactErrors, setContactErrors] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.first_name) errors.first_name = 'First name is required';
    if (!form.middle_name) errors.middle_name = 'Middle name is required';
    if (!form.last_name) errors.last_name = 'Last name is required';
    if (!form.birthdate) errors.birthdate = 'Birthdate is required';
    if (!form.sex) errors.sex = 'Sex is required';
    if (!form.address) errors.address = 'Address is required';
    if (!form.birthplace) errors.birthplace = 'Birthplace is required';
    if (!form.religion) errors.religion = 'Religion is required';
    if (form.religion === 'Other' && !form.other_religion)
      errors.other_religion = 'Please specify religion';
    if (!form.ethnicity) errors.ethnicity = 'Ethnicity is required';
    if (form.ethnicity === 'Other' && !form.other_ethnicity)
      errors.other_ethnicity = 'Please specify ethnicity';
    if (!form.chief_complaints)
      errors.chief_complaints = 'Chief of complaints is required';
    if (!form.room_no) errors.room_no = 'Room number is required';
    if (!form.bed_no) errors.bed_no = 'Bed number is required';

    contacts.forEach((contact, index) => {
      if (!contact.name) errors[`contact_name_${index}`] = 'Contact name is required';
      if (!contact.relationship) errors[`contact_relationship_${index}`] = 'Relationship is required';
      if (!contact.number) errors[`contact_number_${index}`] = 'Contact number is required';
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const capitalize = (str: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  const formatNameOnBlur = (field: keyof typeof form) => {
    setForm(prev => ({ ...prev, [field]: capitalize(prev[field] as string) }));
    if (form[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
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
    setFormErrors(prev => ({ ...prev, [`contact_number_${index}`]: '' }));
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

  const registerPatient = async () => {
    if (!validateForm()) {
      throw new Error('Please fill in all required fields.');
    }
    if (contactErrors.some(e => e !== '')) {
      throw new Error('Please correct the contact number errors.');
    }

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
      is_active: true,
    };

    try {
      const response = await apiClient.post('/patients/', payload);
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
    contacts,
    setContacts,
    contactErrors,
    formatNameOnBlur,
    handleNumberChange,
    validateNumberOnBlur,
    setFormErrors,
    formErrors,
    validateForm,
    registerPatient,
    capitalize,
  };
};
