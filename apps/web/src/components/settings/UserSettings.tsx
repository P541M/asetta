import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import ProfileSection from "./ProfileSection";
import PreferencesSection from "./PreferencesSection";
import NotificationsSection from "./NotificationsSection";
import EmailConfirmationStatus from "./EmailConfirmationStatus";
import SettingsActions from "./SettingsActions";
import SettingsMessage from "./SettingsMessage";
import { ProfileForm } from "../../types/profile";
import { NotificationsForm } from "../../types/preferences";
import { isValidEmail } from "../../utils/validation";
import { notificationEmailStatus } from "../../utils/notificationEmail";
import { requestConfirmLink, type ConfirmLinkRequest } from "../../lib/notificationEmailClient";
import {
  DisplayPreferences,
  DEFAULT_DISPLAY_PREFERENCES,
  displayPreferencesFromUserDoc,
} from "../../utils/userDoc";

type Message = { text: string; type: "success" | "error" } | null;

const isDirty = <T extends object>(form: T, saved: T | null) =>
  saved !== null && (Object.keys(form) as (keyof T)[]).some((key) => form[key] !== saved[key]);

const UserSettings = () => {
  const { user, verifiedEmail } = useAuth();

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    displayName: user?.displayName || "",
    institution: "",
  });
  const [savedProfile, setSavedProfile] = useState<ProfileForm | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<Message>(null);

  const [prefs, setPrefs] = useState<DisplayPreferences>(DEFAULT_DISPLAY_PREFERENCES);
  const [prefsError, setPrefsError] = useState<string | null>(null);

  const [notifForm, setNotifForm] = useState<NotificationsForm>({
    emailNotifications: false,
    notificationDaysBefore: 1,
    email: "",
    notifySubmittedAssessments: true,
  });
  const [savedNotif, setSavedNotif] = useState<NotificationsForm | null>(null);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifMessage, setNotifMessage] = useState<Message>(null);
  const [linkState, setLinkState] = useState<ConfirmLinkRequest | null>(null);
  const [linkSending, setLinkSending] = useState(false);

  // A chosen address gets reminders once confirmed (A17); verifiedEmail is live from the user doc
  const accountEmail = user?.email ?? null;
  const emailStatus = notificationEmailStatus({
    email: notifForm.email,
    verifiedEmail,
    accountEmail,
  });
  const emailIsSaved = notifForm.email.trim() === (savedNotif?.email ?? "").trim();

  const setProfileField = <K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) =>
    setProfileForm((form) => ({ ...form, [field]: value }));

  const setNotifField = <K extends keyof NotificationsForm>(
    field: K,
    value: NotificationsForm[K],
  ) => setNotifForm((form) => ({ ...form, [field]: value }));

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const userSnapshot = await getDoc(doc(db, "users", user.uid));
        if (!userSnapshot.exists()) return;
        const userData = userSnapshot.data();

        const profile: ProfileForm = {
          displayName: user.displayName || "",
          institution: userData.institution || "",
        };
        const notifications: NotificationsForm = {
          emailNotifications: userData.emailNotifications ?? false,
          notificationDaysBefore: userData.notificationDaysBefore ?? 1,
          email: userData.email || "",
          notifySubmittedAssessments: userData.notifySubmittedAssessments ?? true,
        };

        setProfileForm(profile);
        setSavedProfile(profile);
        setNotifForm(notifications);
        setSavedNotif(notifications);
        setPrefs(displayPreferencesFromUserDoc(userData));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user]);

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setProfileSaving(true);
    setProfileMessage(null);

    try {
      if (profileForm.displayName !== savedProfile?.displayName) {
        await updateProfile(user, { displayName: profileForm.displayName });
      }
      await updateDoc(doc(db, "users", user.uid), { ...profileForm, updatedAt: new Date() });
      setSavedProfile(profileForm);
      setProfileMessage({ text: "Profile updated", type: "success" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setProfileMessage({ text: "Failed to update profile. Please try again.", type: "error" });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePrefChange = async (field: keyof DisplayPreferences, value: boolean) => {
    const previous = prefs;
    setPrefs({ ...prefs, [field]: value });
    setPrefsError(null);
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid), { [field]: value, updatedAt: new Date() });
    } catch (error) {
      console.error("Error saving preference:", error);
      setPrefs(previous);
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
      await updateDoc(doc(db, "users", user.uid), {
        ...notifForm,
        // Consent mirrors the notifications toggle (one decision, stored in both fields)
        hasConsentedToNotifications: notifForm.emailNotifications,
        // The reminder cron looks at this user at its next run, so a change after 9:30 applies today
        nextReminderAt: serverTimestamp(),
        updatedAt: new Date(),
      });
      // A new address that isn't confirmed gets its link as soon as it is saved
      const needsLink =
        notifForm.emailNotifications && emailStatus === "unconfirmed" && !emailIsSaved;
      setSavedNotif(notifForm);
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

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-card p-6 shadow-soft md:p-8">
        <form onSubmit={handleProfileSave}>
          <ProfileSection form={profileForm} onChange={setProfileField} />
          <SettingsMessage
            text={profileMessage?.text ?? ""}
            type={profileMessage?.type ?? "success"}
          />
          <SettingsActions dirty={isDirty(profileForm, savedProfile)} saving={profileSaving} />
        </form>
      </section>

      <section className="rounded-xl bg-card p-6 shadow-soft md:p-8">
        <PreferencesSection prefs={prefs} onPrefChange={handlePrefChange} />
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
          <SettingsActions dirty={isDirty(notifForm, savedNotif)} saving={notifSaving} />
        </form>
      </section>
    </div>
  );
};

export default UserSettings;
