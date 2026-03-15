import React, { createContext, useContext, useRef } from 'react';
import Toast, { ToastRef, ToastType } from '../components/Toast';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toastRef = useRef<ToastRef>(null);

  const showToast = (message: string, type: ToastType = 'info', duration?: number) => {
    toastRef.current?.show(message, type, duration);
  };

  const hideToast = () => {
    toastRef.current?.hide();
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast ref={toastRef} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
