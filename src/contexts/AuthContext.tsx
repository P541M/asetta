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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

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
          // Create a new document if it doesn’t exist
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
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
