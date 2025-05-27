export interface NotificationPreferences {
  emailNotifications: boolean;
  setEmailNotifications: (enabled: boolean) => void;
  smsNotifications: boolean;
  setSmsNotifications: (enabled: boolean) => void;
  notificationDaysBefore: number;
  setNotificationDaysBefore: (days: number) => void;
  email: string;
  setEmail: (email: string) => void;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  hasConsentedToNotifications: boolean;
  setHasConsentedToNotifications: (consented: boolean) => void;
}
