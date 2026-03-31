import React, { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';
import { View, LayoutRectangle } from 'react-native';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetRef?: React.RefObject<View | null>;
  position?: 'top' | 'bottom' | 'left' | 'right';
  route?: string; // Route to navigate to for this step
}

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  steps: TutorialStep[];
  startTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  endTutorial: () => void;
  registerTarget: (id: string, ref: React.RefObject<View | null>) => void;
  getTargetLayout: (id: string) => Promise<LayoutRectangle | null>;
  setNavigationHandler: (handler: (route: string) => void) => void;
}

const defaultSteps: TutorialStep[] = [
  {
    id: 'home',
    title: 'Home',
    description: 'View your dashboard summary, recent patients, and quick stats at a glance.',
    position: 'top',
    route: 'Home',
  },
  {
    id: 'search',
    title: 'Search Patients',
    description: 'Quickly find any patient by name, ID, or other details.',
    position: 'top',
    route: 'Search',
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Access all EHR features like Medical History, Vital Signs, and more.',
    position: 'top',
    route: 'Dashboard',
  },
  {
    id: 'register',
    title: 'Add Patient',
    description: 'Register a new patient into the system with their details.',
    position: 'top',
    route: 'Home',
  },
];

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider = ({ children }: { children: ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const targetRefs = useRef<Map<string, React.RefObject<View | null>>>(new Map());
  const navigationHandler = useRef<((route: string) => void) | null>(null);

  const setNavigationHandler = useCallback((handler: (route: string) => void) => {
    navigationHandler.current = handler;
  }, []);

  const navigateToStep = useCallback((stepIndex: number) => {
    const step = defaultSteps[stepIndex];
    if (step?.route && navigationHandler.current) {
      navigationHandler.current(step.route);
    }
  }, []);

  const registerTarget = useCallback((id: string, ref: React.RefObject<View | null>) => {
    targetRefs.current.set(id, ref);
  }, []);

  const getTargetLayout = useCallback((id: string): Promise<LayoutRectangle | null> => {
    return new Promise((resolve) => {
      const ref = targetRefs.current.get(id);
      if (ref?.current) {
        ref.current.measureInWindow((x, y, width, height) => {
          if (width > 0 && height > 0) {
            resolve({ x, y, width, height });
          } else {
            resolve(null);
          }
        });
      } else {
        resolve(null);
      }
    });
  }, []);

  const startTutorial = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
    // Navigate to first step's route
    setTimeout(() => navigateToStep(0), 100);
  }, [navigateToStep]);

  const nextStep = useCallback(() => {
    if (currentStep < defaultSteps.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      // Navigate to next step's route after state update
      setTimeout(() => navigateToStep(nextIdx), 100);
    } else {
      setIsActive(false);
      setCurrentStep(0);
    }
  }, [currentStep, navigateToStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      // Navigate to previous step's route after state update
      setTimeout(() => navigateToStep(prevIdx), 100);
    }
  }, [currentStep, navigateToStep]);

  const endTutorial = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
  }, []);

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        steps: defaultSteps,
        startTutorial,
        nextStep,
        prevStep,
        endTutorial,
        registerTarget,
        getTargetLayout,
        setNavigationHandler,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
};
