import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { AuthContextType } from "../types/context";
import { useUserDoc } from "../hooks/useUserDoc";
import {
  DEFAULT_DISPLAY_PREFERENCES,
  displayPreferencesFromUserDoc,
  notificationSettingsFromUserDoc,
  onboardingChoicesFromUserDoc,
  onboardingStatusFromUserDoc,
  profileFromUserDoc,
  verifiedEmailFromUserDoc,
} from "../utils/userDoc";

const logout = async () => {
  await signOut(auth);
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userDocError: null,
  onboardingStatus: null,
  profile: profileFromUserDoc(undefined),
  displayPreferences: DEFAULT_DISPLAY_PREFERENCES,
  notificationSettings: notificationSettingsFromUserDoc(undefined),
  onboardingChoices: onboardingChoicesFromUserDoc(undefined),
  verifiedEmail: null,
  logout,
});

export const useAuth = () => useContext(AuthContext);

/**
 * The signed-in user and their user doc. The doc is read once, live (useUserDoc), and everything
 * the app shows from it (profile, display preferences, notification settings, onboarding status
 * and choices, the confirmed notification address) derives from that one read.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const userDoc = useUserDoc(user);

  useEffect(
    () =>
      onAuthStateChanged(auth, (usr) => {
        setUser(usr);
        setAuthLoading(false);
      }),
    [],
  );

  const value = useMemo<AuthContextType>(() => {
    const docReady = user !== null && !userDoc.loading && userDoc.error === null;
    return {
      user,
      loading: authLoading || userDoc.loading,
      userDocError: userDoc.error,
      onboardingStatus: docReady ? onboardingStatusFromUserDoc(userDoc.data) : null,
      profile: profileFromUserDoc(userDoc.data),
      displayPreferences: displayPreferencesFromUserDoc(userDoc.data),
      notificationSettings: notificationSettingsFromUserDoc(userDoc.data),
      onboardingChoices: onboardingChoicesFromUserDoc(userDoc.data),
      verifiedEmail: verifiedEmailFromUserDoc(userDoc.data),
      logout,
    };
  }, [user, authLoading, userDoc]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
