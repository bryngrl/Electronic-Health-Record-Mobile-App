import { useState, useMemo } from 'react';

// Define the sequence of time slots for data entry
const TIME_SLOTS = ['6:00 AM', '8:00 AM', '12:00 PM', '2:00 PM', '6:00 PM', '8:00 PM', '12:00 AM'];

// Define the shape of the vitals data
export interface Vitals {
  temperature: string;
  hr: string;
  rr: string;
  bp: string;
  spo2: string;
}

// Initial empty state for a set of vitals
const initialVitals: Vitals = {
  temperature: '',
  hr: '',
  rr: '',
  bp: '',
  spo2: '',
};

export const useVitalSignsLogic = () => {
  const [patientName, setPatientName] = useState('');
  
  // State to hold the history of vitals recorded at each time slot
  const [vitalsHistory, setVitalsHistory] = useState<Record<string, Vitals>>({});
  
  // State for the vitals currently being entered
  const [currentVitals, setCurrentVitals] = useState<Vitals>(initialVitals);
  
  // State to track the current position in the TIME_SLOTS array
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);

  // --- DERIVED STATE ---
  
  // Get the current time slot string (e.g., "6:00 AM")
  const currentTime = useMemo(() => TIME_SLOTS[currentTimeIndex], [currentTimeIndex]);

  // Check if any data has been entered in the current form
  const isDataEntered = useMemo(() => {
    return Object.values(currentVitals).some(value => value.trim() !== '');
  }, [currentVitals]);
  
  // --- HANDLERS ---

  // Update the state for the current input fields
  const handleUpdateVital = (key: keyof Vitals, value: string) => {
    setCurrentVitals(prev => ({ ...prev, [key]: value }));
  };

  // "Save" current data and move to the next time slot
  const handleNextTime = () => {
    // Proceed only if data has been entered and we are not at the end of the time slots
    if (isDataEntered && currentTimeIndex < TIME_SLOTS.length - 1) {
      // Save the current vitals into the history, keyed by the current time
      setVitalsHistory(prev => ({
        ...prev,
        [currentTime]: currentVitals,
      }));
      // Move to the next time slot
      setCurrentTimeIndex(prev => prev + 1);
      // Reset the input fields for the new time slot
      setCurrentVitals(initialVitals);
    }
  };

  // --- DATA EXTRACTORS ---

  // Get all historical data for a single vital sign to be used in a chart
  const getChartData = (vitalKey: keyof Vitals) => {
    // Include the current (unsaved) value in the chart data if it exists
    const currentPoint = { time: currentTime, value: parseFloat(currentVitals[vitalKey]) || 0 };
    
    const historicalData = Object.entries(vitalsHistory).map(([time, vitals]) => ({
      time,
      value: parseFloat(vitals[vitalKey]) || 0,
    }));
    
    return [...historicalData, currentPoint];
  };

  return {
    patientName,
    setPatientName,
    vitals: currentVitals, // The screen binds to the current vitals
    handleUpdateVital,
    isDataEntered,
    currentTime,
    handleNextTime,
    getChartData,
    vitalKeys: Object.keys(initialVitals) as (keyof Vitals)[],
  };
};