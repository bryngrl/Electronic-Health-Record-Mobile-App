import { useState } from 'react';

const useIvsAndLinesData = () => {
  // State for the patient name text input
  const [patientName, setPatientName] = useState('');

  // Placeholder function for submitting the form data
  const handleSubmit = () => {
    // In a real application, this would send data to an API or database.
    console.log('Submitting IVs and Lines data for:', patientName);
    // You could reset the form here if needed.
    // setPatientName('');
  };

  return {
    patientName,
    setPatientName,
    handleSubmit,
  };
};

export default useIvsAndLinesData;
