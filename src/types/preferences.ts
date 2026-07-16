import type { DisplayPreferences } from "../hooks/useDisplayPreferences";

export interface PreferencesSectionProps {
  prefs: DisplayPreferences;
  onPrefChange: (field: keyof DisplayPreferences, value: boolean) => void;
}

export interface NotificationsForm {
  emailNotifications: boolean;
  notificationDaysBefore: number;
  email: string;
}

export interface NotificationsSectionProps {
  form: NotificationsForm;
  onChange: <K extends keyof NotificationsForm>(field: K, value: NotificationsForm[K]) => void;
}
