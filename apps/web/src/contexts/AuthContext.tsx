// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { AuthContextType } from "../types/context";
import { useOnboardingStatus } from "../hooks/useOnboardingStatus";
import { devError } from "../utils/devLog";

/** Asks the server for the welcome email. It goes to the account's own address, at most once. */
async function requestWelcomeEmail(usr: User, displayName: string) {
  try {
    const token = await usr.getIdToken();
    const response = await fetch("/api/welcome-email", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ displayName }),
    });
    if (!response.ok) {
      devError("Welcome email request failed");
    }
  } catch {
    devError("Welcome email request error");
  }
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  onboardingStatus: null,
  onboardingLoading: true,
  refreshOnboardingStatus: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Use the onboarding status hook
  const {
    onboardingStatus,
    loading: onboardingLoading,
    refreshStatus: refreshOnboardingStatus,
  } = useOnboardingStatus(user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usr) => {
      setUser(usr);
      if (usr) {
        // Check if user document exists in Firestore
        const userRef = doc(db, "users", usr.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          // Create a new document if it doesn't exist
          const defaultSettings = {
            displayName: usr.displayName || usr.email?.split("@")[0] || "User",
            email: usr.email || "",
            institution: "",
            createdAt: new Date(),
            lastLogin: new Date(),
          };
          await setDoc(userRef, defaultSettings);

          // Every new user doc (email and Google sign-ups alike) requests the welcome email.
          // Not awaited: sign-in shouldn't wait on the mail server.
          void requestWelcomeEmail(usr, defaultSettings.displayName);
        } else {
          // Update lastLogin if document already exists
          await setDoc(userRef, { lastLogin: new Date() }, { merge: true });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        onboardingStatus,
        onboardingLoading,
        refreshOnboardingStatus,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
