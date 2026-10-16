import type { ReactNode } from "react";
import type { DisplayPreferences } from "../utils/userDoc";

export interface PreferencesSectionProps {
  prefs: DisplayPreferences;
  onPrefChange: (field: keyof DisplayPreferences, value: boolean) => void;
}

export interface NotificationsForm {
  emailNotifications: boolean;
  notificationDaysBefore: number;
  email: string;
  notifySubmittedAssessments: boolean;
}

export interface NotificationsSectionProps {
  form: NotificationsForm;
  onChange: <K extends keyof NotificationsForm>(field: K, value: NotificationsForm[K]) => void;
  /** Shown under the address: whether it is confirmed, and where reminders go until it is. */
  emailStatus?: ReactNode;
}
