import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';

interface UserProfile {
  avatarColor: "blue" | "green" | "purple" | "orange" | "red" | "pink" | "indigo" | "teal";
  displayName: string;
  institution: string;
  studyProgram: string;
  graduationYear: number;
  showDaysTillDue: boolean;
  showWeight: boolean;
  showNotes: boolean;
  showStatsBar: boolean;
  emailNotifications: boolean;
  notificationDaysBefore: number;
  email: string;
  hasConsentedToNotifications: boolean;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setProfile(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setProfile({
            avatarColor: userData.avatarColor || "blue",
            displayName: userData.displayName || "",
            institution: userData.institution || "",
            studyProgram: userData.studyProgram || "",
            graduationYear: userData.graduationYear || new Date().getFullYear() + 4,
            showDaysTillDue: userData.showDaysTillDue ?? true,
            showWeight: userData.showWeight ?? true,
            showNotes: userData.showNotes ?? true,
            showStatsBar: userData.showStatsBar ?? false,
            emailNotifications: userData.emailNotifications ?? false,
            notificationDaysBefore: userData.notificationDaysBefore ?? 1,
            email: userData.email || "",
            hasConsentedToNotifications: userData.hasConsentedToNotifications ?? false,
          });
        } else {
          // Set default profile if document doesn't exist
          setProfile({
            avatarColor: "blue",
            displayName: "",
            institution: "",
            studyProgram: "",
            graduationYear: new Date().getFullYear() + 4,
            showDaysTillDue: true,
            showWeight: true,
            showNotes: true,
            showStatsBar: false,
            emailNotifications: false,
            notificationDaysBefore: 1,
            email: "",
            hasConsentedToNotifications: false,
          });
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  return { profile, loading, error };
};