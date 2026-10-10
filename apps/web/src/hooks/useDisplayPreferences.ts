import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { getDoc } from "firebase/firestore";
import { getUserDocRef } from "../lib/firebaseUtils";

export interface DisplayPreferences {
  showDaysTillDue: boolean;
  showWeight: boolean;
  showNotes: boolean;
  showStatsBar: boolean;
}

export const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  showDaysTillDue: true,
  showWeight: true,
  showNotes: true,
  showStatsBar: false,
};

/**
 * Reads the user's display preferences from their Firestore user document.
 * Fetches on mount (and when the user changes), matching how the dashboard
 * has always picked up preference changes saved on the settings page.
 */
export function useDisplayPreferences(user: User | null): DisplayPreferences {
  const [preferences, setPreferences] = useState<DisplayPreferences>(DEFAULT_DISPLAY_PREFERENCES);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return;
      try {
        const userSnapshot = await getDoc(getUserDocRef(user.uid));
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setPreferences({
            showDaysTillDue: userData.showDaysTillDue ?? true,
            showWeight: userData.showWeight ?? true,
            showNotes: userData.showNotes ?? true,
            showStatsBar: userData.showStatsBar ?? false,
          });
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
      }
    };

    fetchUserPreferences();
  }, [user]);

  return preferences;
}
