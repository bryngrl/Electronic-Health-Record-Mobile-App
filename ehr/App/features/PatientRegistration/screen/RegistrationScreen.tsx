import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
// FIX 1: Default import resolves the "no exported member" error
import RegistrationForm from '../component/RegistrationForm';
import { useRegistration } from '../hook/useRegistration';

interface RegistrationScreenProps {
  onBack: () => void;
}

export default function RegistrationScreen({ onBack }: RegistrationScreenProps) {
  const { updateField } = useRegistration();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.mainTitle}>REGISTER PATIENT</Text>
        {/* FIX 2: Passing onBack resolves the missing property error */}
        <RegistrationForm updateField={updateField} onBack={onBack} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  scroll: { flex: 1, padding: 15 },
  mainTitle: { 
    fontSize: 24, 
    fontWeight: '900', 
    color: '#004d26', 
    marginBottom: 20,
     
  }
});