import { useState } from 'react';

export const useRegistration = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', middleName: '', lastName: '',
    birthdate: '', age: '', sex: '',
    address: '', chiefComplaints: '',
    roomNo: '', bedNo: ''
  });

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return { 
    formData, 
    updateField, 
    isMenuOpen, 
    toggleMenu 
  };
};