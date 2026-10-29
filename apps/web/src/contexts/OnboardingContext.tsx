import React, { createContext, useContext, useReducer, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { useAuth } from "./AuthContext";
import { db } from "../lib/firestore";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { notificationEmailStatus } from "../utils/notificationEmail";
import { onboardingChoicesToWrite } from "../utils/userDoc";
import { requestConfirmLink } from "../lib/notificationEmailClient";
import {
  OnboardingState,
  OnboardingContextType,
  OnboardingUserData,
  OnboardingSemesterData,
} from "../types/onboarding";
import { ExtractionResult } from "../types/upload";

// Initial state
const initialState: OnboardingState = {
  currentStep: 1,
  totalSteps: 6,
  // Only what the student changes here; the provider lays it over the user doc's choices
  userData: {},
  semesterData: { name: "" },
  isLoading: false,
  error: null,
  hasCompletedUpload: false,
  extractionResults: null,
  showExitModal: false,
};

// Action types
type OnboardingAction =
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_STEP"; payload: number }
  | { type: "UPDATE_USER_DATA"; payload: Partial<OnboardingUserData> }
  | { type: "UPDATE_SEMESTER_DATA"; payload: Partial<OnboardingSemesterData> }
  | { type: "SET_CREATED_SEMESTER_ID"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_UPLOAD_COMPLETE"; payload: ExtractionResult }
  | { type: "SHOW_EXIT_MODAL" }
  | { type: "HIDE_EXIT_MODAL" };

// Reducer
function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case "NEXT_STEP":
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.totalSteps),
      };
    case "PREV_STEP":
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1),
      };
    case "SET_STEP":
      return {
        ...state,
        currentStep: Math.min(Math.max(action.payload, 1), state.totalSteps),
      };
    case "UPDATE_USER_DATA":
      return {
        ...state,
        userData: { ...state.userData, ...action.payload },
      };
    case "UPDATE_SEMESTER_DATA":
      return {
        ...state,
        semesterData: { ...state.semesterData, ...action.payload },
      };
    case "SET_CREATED_SEMESTER_ID":
      return {
        ...state,
        createdSemesterId: action.payload,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    case "SET_UPLOAD_COMPLETE":
      return {
        ...state,
        hasCompletedUpload: true,
        extractionResults: action.payload,
      };
    case "SHOW_EXIT_MODAL":
      return {
        ...state,
        showExitModal: true,
      };
    case "HIDE_EXIT_MODAL":
      return {
        ...state,
        showExitModal: false,
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
  const { user, verifiedEmail, onboardingChoices } = useAuth();
  const router = useRouter();

  // The form starts from the choices on the user doc, which useAuth reads live (A54), with the
  // student's changes on top
  const userData = useMemo(
    () => ({ ...onboardingChoices, ...state.userData }),
    [onboardingChoices, state.userData],
  );

  const nextStep = useCallback(() => {
    dispatch({ type: "NEXT_STEP" });
  }, []);

  const prevStep = useCallback(() => {
    dispatch({ type: "PREV_STEP" });
  }, []);

  const setStep = useCallback((step: number) => {
    dispatch({ type: "SET_STEP", payload: step });
  }, []);

  const updateUserData = useCallback((data: Partial<OnboardingUserData>) => {
    dispatch({ type: "UPDATE_USER_DATA", payload: data });
  }, []);

  const updateSemesterData = useCallback((data: Partial<OnboardingSemesterData>) => {
    dispatch({ type: "UPDATE_SEMESTER_DATA", payload: data });
  }, []);

  const setCreatedSemesterId = useCallback((id: string) => {
    dispatch({ type: "SET_CREATED_SEMESTER_ID", payload: id });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  }, []);

  const setUploadComplete = useCallback((results: ExtractionResult) => {
    dispatch({ type: "SET_UPLOAD_COMPLETE", payload: results });
  }, []);

  const requestExit = useCallback(() => {
    dispatch({ type: "SHOW_EXIT_MODAL" });
  }, []);

  const cancelExit = useCallback(() => {
    dispatch({ type: "HIDE_EXIT_MODAL" });
  }, []);

  const confirmExit = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Mark onboarding as completed (skipped) without saving profile data
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        hasCompletedOnboarding: true,
        onboardingCompletedAt: new Date(),
        onboardingSkipped: true, // Flag to indicate it was skipped
      });

      // Hide modal and navigate to dashboard
      dispatch({ type: "HIDE_EXIT_MODAL" });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error skipping onboarding:", error);
      setError("Failed to skip onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, router, setLoading, setError]);

  const completeOnboarding = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Update user document with onboarding completion and profile data
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        hasCompletedOnboarding: true,
        onboardingCompletedAt: new Date(),
        ...onboardingChoicesToWrite(userData),
        // The reminder cron looks at this user at its next run, with the settings chosen here
        nextReminderAt: serverTimestamp(),
      });

      // Another address gets reminders once confirmed through its link (A17). Not awaited:
      // finishing shouldn't wait on the mail server, and Settings can send the link again.
      const unconfirmed =
        notificationEmailStatus({
          email: userData.email,
          verifiedEmail,
          accountEmail: user.email,
        }) === "unconfirmed";
      if (userData.emailNotifications && unconfirmed) void requestConfirmLink(user);

      // Navigate to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setError("Failed to complete onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, verifiedEmail, userData, router, setLoading, setError]);

  const value: OnboardingContextType = {
    state: { ...state, userData },
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
    requestExit,
    cancelExit,
    confirmExit,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

// Custom hook to use onboarding context
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
