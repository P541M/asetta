import type { ReactNode } from "react";
import type { DisplayPreferences, NotificationSettings } from "../utils/userDoc";

export interface PreferencesSectionProps {
  prefs: DisplayPreferences;
  onPrefChange: (field: keyof DisplayPreferences, value: boolean) => void;
}

export interface NotificationsSectionProps {
  form: NotificationSettings;
  onChange: <K extends keyof NotificationSettings>(
    field: K,
    value: NotificationSettings[K],
  ) => void;
  /** Shown under the address: whether it is confirmed, and where reminders go until it is. */
  emailStatus?: ReactNode;
}
