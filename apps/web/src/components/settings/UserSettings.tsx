import { useState, FormEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  saveDisplayPreference,
  saveNotificationSettings,
  saveProfile,
} from "../../hooks/userDocWrites";
import ProfileSection from "./ProfileSection";
import PreferencesSection from "./PreferencesSection";
import NotificationsSection from "./NotificationsSection";
import EmailConfirmationStatus from "./EmailConfirmationStatus";
import SettingsActions from "./SettingsActions";
import SettingsMessage from "./SettingsMessage";
import { formWithEdits, isDirty, unsavedEdits } from "../../utils/formEdits";
import { isValidEmail } from "../../utils/validation";
import { notificationEmailStatus } from "../../utils/notificationEmail";
import { requestConfirmLink, type ConfirmLinkRequest } from "../../lib/notificationEmailClient";
import type { DisplayPreferences, NotificationSettings, UserProfile } from "../../utils/userDoc";

type Message = { text: string; type: "success" | "error" } | null;

const UserSettings = () => {
  const { user, verifiedEmail, profile, displayPreferences, notificationSettings } = useAuth();

  // The card edits Auth's name, not the doc's copy: an account without one in Auth starts empty
  const savedProfile: UserProfile = {
    displayName: user?.displayName || "",
    institution: profile.institution,
  };
  const [profileEdits, setProfileEdits] = useState<Partial<UserProfile>>({});
  const profileForm = formWithEdits(savedProfile, profileEdits);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<Message>(null);

  const [prefsError, setPrefsError] = useState<string | null>(null);

  const [notifEdits, setNotifEdits] = useState<Partial<NotificationSettings>>({});
  const notifForm = formWithEdits(notificationSettings, notifEdits);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifMessage, setNotifMessage] = useState<Message>(null);
  const [linkState, setLinkState] = useState<ConfirmLinkRequest | null>(null);
  const [linkSending, setLinkSending] = useState(false);

  // A chosen address gets reminders once confirmed; verifiedEmail is live from the user doc
  const accountEmail = user?.email ?? null;
  const emailStatus = notificationEmailStatus({
    email: notifForm.email,
    verifiedEmail,
    accountEmail,
  });
  // The live doc shows a new address as soon as its save starts, before the server has it, and a
  // confirm link goes to what the server has
  const emailIsSaved =
    notifForm.email.trim() === notificationSettings.email.trim() &&
    !(notifSaving && "email" in notifEdits);

  const setProfileField = <K extends keyof UserProfile>(field: K, value: UserProfile[K]) =>
    setProfileEdits((edits) => ({ ...edits, [field]: value }));

  const setNotifField = <K extends keyof NotificationSettings>(
    field: K,
    value: NotificationSettings[K],
  ) => setNotifEdits((edits) => ({ ...edits, [field]: value }));

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setProfileSaving(true);
    setProfileMessage(null);

    try {
      await saveProfile(user, profileForm);
      setProfileEdits((edits) => unsavedEdits(edits, profileForm));
      setProfileMessage({ text: "Profile updated", type: "success" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setProfileMessage({ text: "Failed to update profile. Please try again.", type: "error" });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePrefChange = async (field: keyof DisplayPreferences, value: boolean) => {
    setPrefsError(null);
    if (!user) return;

    try {
      await saveDisplayPreference(user.uid, field, value);
    } catch (error) {
      console.error("Error saving preference:", error);
      setPrefsError("Failed to save preference. Please try again.");
    }
  };

  const sendConfirmLink = async () => {
    if (!user) return;
    setLinkSending(true);
    setLinkState(await requestConfirmLink(user));
    setLinkSending(false);
  };

  const handleNotifSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (notifForm.emailNotifications && notifForm.email && !isValidEmail(notifForm.email)) {
      setNotifMessage({ text: "Please enter a valid email address", type: "error" });
      return;
    }

    setNotifSaving(true);
    setNotifMessage(null);

    try {
      await saveNotificationSettings(user.uid, notifForm);
      // A new address that isn't confirmed gets its link as soon as it is saved
      const needsLink =
        notifForm.emailNotifications && emailStatus === "unconfirmed" && !emailIsSaved;
      setNotifEdits((edits) => unsavedEdits(edits, notifForm));
      setNotifMessage({ text: "Notification settings updated", type: "success" });
      setLinkState(null);
      if (needsLink) void sendConfirmLink();
    } catch (error) {
      console.error("Error updating notification settings:", error);
      setNotifMessage({
        text: "Failed to update notification settings. Please try again.",
        type: "error",
      });
    } finally {
      setNotifSaving(false);
    }
  };

  // Auth keeps a new name even when the doc write after it fails, so the edit then matches what
  // is loaded; a failed save has to stay saveable
  const profileDirty = isDirty(profileEdits, savedProfile) || profileMessage?.type === "error";

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-card p-6 shadow-soft md:p-8">
        <form onSubmit={handleProfileSave}>
          <ProfileSection form={profileForm} onChange={setProfileField} />
          <SettingsMessage
            text={profileMessage?.text ?? ""}
            type={profileMessage?.type ?? "success"}
          />
          <SettingsActions dirty={profileDirty} saving={profileSaving} />
        </form>
      </section>

      <section className="rounded-xl bg-card p-6 shadow-soft md:p-8">
        <PreferencesSection prefs={displayPreferences} onPrefChange={handlePrefChange} />
        <SettingsMessage text={prefsError ?? ""} type="error" />
      </section>

      <section className="rounded-xl bg-card p-6 shadow-soft md:p-8">
        <form onSubmit={handleNotifSave}>
          <NotificationsSection
            form={notifForm}
            onChange={setNotifField}
            emailStatus={
              <EmailConfirmationStatus
                status={emailStatus}
                accountEmail={accountEmail}
                saved={emailIsSaved}
                linkState={linkState}
                sending={linkSending}
                onSendLink={sendConfirmLink}
              />
            }
          />
          <SettingsMessage text={notifMessage?.text ?? ""} type={notifMessage?.type ?? "success"} />
          <SettingsActions dirty={isDirty(notifEdits, notificationSettings)} saving={notifSaving} />
        </form>
      </section>
    </div>
  );
};

export default UserSettings;
