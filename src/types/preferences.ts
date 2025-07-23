export interface PreferencesSectionProps {
  showDaysTillDue: boolean;
  setShowDaysTillDue: (value: boolean) => void;
  showWeight: boolean;
  setShowWeight: (value: boolean) => void;
  showNotes: boolean;
  setShowNotes: (value: boolean) => void;
  showStatsBar: boolean;
  setShowStatsBar: (value: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

export interface NotificationPreferencesProps {
  emailNotifications: boolean;
  setEmailNotifications: (value: boolean) => void;
  notificationDaysBefore: number;
  setNotificationDaysBefore: (value: number) => void;
  email: string;
  setEmail: (value: string) => void;
  hasConsentedToNotifications: boolean;
  setHasConsentedToNotifications: (value: boolean) => void;
}
