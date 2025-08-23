import { ExtractionResult } from './upload';

export interface OnboardingUserData {
  institution?: string;
  studyProgram?: string;
  graduationYear?: number;
  avatarIconId?: string;
  hasConsentedToNotifications?: boolean;
  emailNotifications?: boolean;
  notificationDaysBefore?: number;
  email?: string;
}

export interface OnboardingSemesterData {
  name: string;
  startDate?: string;
  endDate?: string;
}

export interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  userData: OnboardingUserData;
  semesterData: OnboardingSemesterData;
  createdSemesterId?: string;
  isLoading: boolean;
  error: string | null;
  hasCompletedUpload: boolean;
  extractionResults: ExtractionResult | null;
  showExitModal: boolean;
}

export interface OnboardingContextType {
  state: OnboardingState;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  updateUserData: (data: Partial<OnboardingUserData>) => void;
  updateSemesterData: (data: Partial<OnboardingSemesterData>) => void;
  setCreatedSemesterId: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUploadComplete: (results: ExtractionResult) => void;
  completeOnboarding: () => Promise<void>;
  requestExit: () => void;
  cancelExit: () => void;
  confirmExit: () => Promise<void>;
}

export type OnboardingStep = 
  | 'welcome'
  | 'profile'
  | 'semester'
  | 'upload'
  | 'completion';