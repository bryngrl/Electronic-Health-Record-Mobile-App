import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import LoginScreen from '../App/features/Auth/screen/LoginScreen';

// Mock the useLogin hook
jest.mock('../App/features/Auth/hook/useLogin', () => ({
  useLogin: () => ({
    email: '',
    setEmail: jest.fn(),
    password: '',
    setPassword: jest.fn(),
    isSubmitting: false,
    isPasswordVisible: false,
    togglePasswordVisibility: jest.fn(),
    alertConfig: { visible: false, title: '', message: '', type: 'success' },
    hideAlert: jest.fn(),
    handleLogin: jest.fn(),
  }),
}));

// Mock assets
jest.mock('@assets/icons/ehr_logo.png', () => 'ehr_logo.png');

test('LoginScreen renders correctly', () => {
  const tree = ReactTestRenderer.create(<LoginScreen />).toJSON();
  expect(tree).toBeDefined();
});
