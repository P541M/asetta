// src/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { AuthContextType } from "../types/context";
import { removeFromLocalStorage } from "../utils/localStorage";

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
            studyProgram: "",
            graduationYear: new Date().getFullYear() + 4,
            createdAt: new Date(),
            lastLogin: new Date(),
          };
          await setDoc(userRef, defaultSettings);

          // Send welcome email for new Google OAuth users (non-blocking)
          try {
            const response = await fetch('/api/welcome-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                displayName: defaultSettings.displayName,
                email: defaultSettings.email,
                institution: defaultSettings.institution,
                studyProgram: defaultSettings.studyProgram,
              }),
            });

            if (response.ok) {
              if (process.env.NODE_ENV === 'development') {
                console.log('✅ Welcome email sent successfully for Google OAuth user');
              }
            } else {
              if (process.env.NODE_ENV === 'development') {
                console.warn('⚠️ Welcome email failed to send for Google OAuth user');
              }
            }
          } catch {
            if (process.env.NODE_ENV === 'development') {
              console.warn('⚠️ Welcome email error for Google OAuth user');
            }
          }
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
    // Clear user-specific cached data before signing out
    removeFromLocalStorage('avatarColor');
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
