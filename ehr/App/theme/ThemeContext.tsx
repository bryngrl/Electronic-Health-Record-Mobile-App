import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react';
import { useColorScheme } from 'react-native';
import { getTheme, getCommonStyles } from './theme';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  theme: any;
  commonStyles: any;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = useMemo(() => getTheme(isDarkMode), [isDarkMode]);
  const commonStyles = useMemo(() => getCommonStyles(isDarkMode), [isDarkMode]);

  const value = {
    isDarkMode,
    toggleDarkMode,
    theme,
    commonStyles,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};
