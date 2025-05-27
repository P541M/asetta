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

export interface NotificationPreferences {
  emailNotifications: boolean;
  notificationDaysBefore: number;
  email: string;
  hasConsentedToNotifications: boolean;
}

export interface NotificationPreferencesProps extends NotificationPreferences {
  setEmailNotifications: (value: boolean) => void;
  setNotificationDaysBefore: (value: number) => void;
  setEmail: (value: string) => void;
  setHasConsentedToNotifications: (value: boolean) => void;
}
