/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View, Text } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [backendData, setBackendData] = useState(null);
  const [error, setError] = useState(null);

  // To connect sa backend natin...
  useEffect(() => {
    fetch('http://localhost:8000/')
      .then(response => response.json())
      .then(data => setBackendData(data))
      .catch(err => setError(err.message));
  }, []);

  return (
    <View style={styles.container}>
      <NewAppScreen
        templateFileName="App.tsx"
        safeAreaInsets={safeAreaInsets}
      />
      {backendData && (
        <View style={{ padding: 16 }}>
          <Text>Backend says: {JSON.stringify(backendData)}</Text>
        </View>
      )}
      {error && (
        <View style={{ padding: 16 }}>
          <Text style={{ color: 'red' }}>Error: {error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
