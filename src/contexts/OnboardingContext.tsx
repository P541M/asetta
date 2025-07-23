import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import {
  OnboardingState,
  OnboardingContextType,
  OnboardingUserData,
  OnboardingSemesterData,
} from '../types/onboarding';
import { ExtractionResult } from '../types/upload';

// Initial state
const initialState: OnboardingState = {
  currentStep: 1,
  totalSteps: 5,
  userData: {},
  semesterData: { name: '' },
  isLoading: false,
  error: null,
  hasCompletedUpload: false,
  extractionResults: null,
};

// Action types
type OnboardingAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'UPDATE_USER_DATA'; payload: Partial<OnboardingUserData> }
  | { type: 'UPDATE_SEMESTER_DATA'; payload: Partial<OnboardingSemesterData> }
  | { type: 'SET_CREATED_SEMESTER_ID'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_UPLOAD_COMPLETE'; payload: ExtractionResult };

// Reducer
function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.totalSteps),
      };
    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1),
      };
    case 'SET_STEP':
      return {
        ...state,
        currentStep: Math.min(Math.max(action.payload, 1), state.totalSteps),
      };
    case 'UPDATE_USER_DATA':
      return {
        ...state,
        userData: { ...state.userData, ...action.payload },
      };
    case 'UPDATE_SEMESTER_DATA':
      return {
        ...state,
        semesterData: { ...state.semesterData, ...action.payload },
      };
    case 'SET_CREATED_SEMESTER_ID':
      return {
        ...state,
        createdSemesterId: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'SET_UPLOAD_COMPLETE':
      return {
        ...state,
        hasCompletedUpload: true,
        extractionResults: action.payload,
      };
    default:
      return state;
  }
}

// Context
const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Provider component
export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);
  const { user } = useAuth();
  const router = useRouter();

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const setStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const updateUserData = useCallback((data: Partial<OnboardingUserData>) => {
    dispatch({ type: 'UPDATE_USER_DATA', payload: data });
  }, []);

  const updateSemesterData = useCallback((data: Partial<OnboardingSemesterData>) => {
    dispatch({ type: 'UPDATE_SEMESTER_DATA', payload: data });
  }, []);

  const setCreatedSemesterId = useCallback((id: string) => {
    dispatch({ type: 'SET_CREATED_SEMESTER_ID', payload: id });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setUploadComplete = useCallback((results: ExtractionResult) => {
    dispatch({ type: 'SET_UPLOAD_COMPLETE', payload: results });
  }, []);

  const completeOnboarding = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Update user document with onboarding completion and profile data
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        hasCompletedOnboarding: true,
        onboardingCompletedAt: new Date(),
        institution: state.userData.institution || '',
        program: state.userData.program || '',
        expectedGraduation: state.userData.expectedGraduation || '',
      });

      // Navigate to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setError('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, state.userData, router, setLoading, setError]);

  const value: OnboardingContextType = {
    state,
    nextStep,
    prevStep,
    setStep,
    updateUserData,
    updateSemesterData,
    setCreatedSemesterId,
    setLoading,
    setError,
    setUploadComplete,
    completeOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

// Custom hook to use onboarding context
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}