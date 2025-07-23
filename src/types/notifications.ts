export interface NotificationPreferences {
  emailNotifications: boolean;
  setEmailNotifications: (enabled: boolean) => void;
  notificationDaysBefore: number;
  setNotificationDaysBefore: (days: number) => void;
  email: string;
  setEmail: (email: string) => void;
  hasConsentedToNotifications: boolean;
  setHasConsentedToNotifications: (consented: boolean) => void;
}
