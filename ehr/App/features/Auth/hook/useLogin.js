import { useState } from 'react';
import { useWindowDimensions } from 'react-native';

export const useLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  return {
    username,
    setUsername,
    password,
    setPassword,
    width,
    height,
    isLandscape,
  };
};