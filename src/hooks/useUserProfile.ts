import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { getFromLocalStorage, setToLocalStorage, removeFromLocalStorage } from '../utils/localStorage';
import { DEFAULT_ICON, isValidIconId } from '../data/profileIcons';

interface UserProfile {
  avatarIconId: string;
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

  // Initialize with cached avatar data for immediate display
  useEffect(() => {
    if (!user) {
      setProfile(null);
      removeFromLocalStorage('avatarIconId');
      return;
    }

    // Get cached avatar data for immediate display
    const cachedAvatarIconId = getFromLocalStorage<string>("avatarIconId", DEFAULT_ICON.id);
    
    // Set initial profile with cached data to prevent flash
    setProfile(prev => prev || {
      avatarIconId: isValidIconId(cachedAvatarIconId) ? cachedAvatarIconId : DEFAULT_ICON.id,
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
  }, [user]);

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
          
          // Handle avatar preferences with emoji->icon migration
          const avatarIconId = userData.avatarIconId && isValidIconId(userData.avatarIconId)
            ? userData.avatarIconId
            : DEFAULT_ICON.id; // Migrate from emoji or set default
          
          // Cache avatar data for immediate future loads
          setToLocalStorage("avatarIconId", avatarIconId);
          
          setProfile({
            avatarIconId: avatarIconId,
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
          // Set default profile if document doesn't exist and cache it
          setToLocalStorage("avatarIconId", DEFAULT_ICON.id);
          setProfile({
            avatarIconId: DEFAULT_ICON.id,
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