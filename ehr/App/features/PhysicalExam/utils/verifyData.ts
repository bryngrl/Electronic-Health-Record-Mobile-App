import apiClient from '../../../api/apiClient';

export const verifyPhysicalExamData = async (examId: number) => {
  try {
    console.log(`[verifyData] Fetching exam ID: ${examId}`);
    const response = await apiClient.get(`/physical-exam/${examId}`);
    console.log('[verifyData] Response:', response.data);
    
    const data = response.data;
    console.log('✓ Data verification:');
    console.log(`  - ID: ${data.id}`);
    console.log(`  - Patient: ${data.patient_id}`);
    console.log(`  - Diagnosis: ${data.diagnosis || 'EMPTY'}`);
    console.log(`  - Planning: ${data.planning || 'EMPTY'}`);
    console.log(`  - Intervention: ${data.intervention || 'EMPTY'}`);
    console.log(`  - Evaluation: ${data.evaluation || 'EMPTY'}`);
    
    return data;
  } catch (err: any) {
    console.error('[verifyData] Error:', err.response?.data || err.message);
    throw err;
  }
};

export const listPatientExams = async (patientId: number) => {
  try {
    console.log(`[listExams] Fetching exams for patient: ${patientId}`);
    const response = await apiClient.get(`/physical-exam/patient/${patientId}`);
    console.log('[listExams] Response:', response.data);
    
    const exams = response.data;
    console.log(`✓ Found ${exams.length} exam(s):`);
    exams.forEach((exam: any, index: number) => {
      console.log(`  [${index}] ID: ${exam.id}, Has Diagnosis: ${!!exam.diagnosis}, Has Planning: ${!!exam.planning}`);
    });
    
    return exams;
  } catch (err: any) {
    console.error('[listExams] Error:', err.response?.data || err.message);
    throw err;
  }
};
