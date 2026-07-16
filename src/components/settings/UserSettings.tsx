import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import ProfileSection from "./ProfileSection";
import PreferencesSection from "./PreferencesSection";
import NotificationsSection from "./NotificationsSection";
import SettingsActions from "./SettingsActions";
import SettingsMessage from "./SettingsMessage";
import { ProfileForm } from "../../types/profile";
import { NotificationsForm } from "../../types/preferences";
import { DisplayPreferences, DEFAULT_DISPLAY_PREFERENCES } from "../../hooks/useDisplayPreferences";

type Message = { text: string; type: "success" | "error" } | null;

const isDirty = <T extends object>(form: T, saved: T | null) =>
  saved !== null && (Object.keys(form) as (keyof T)[]).some((key) => form[key] !== saved[key]);

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const currentYear = new Date().getFullYear();

const UserSettings = () => {
  const { user } = useAuth();

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    displayName: user?.displayName || "",
    institution: "",
    studyProgram: "",
    graduationYear: currentYear + 4,
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
  });
  const [savedNotif, setSavedNotif] = useState<NotificationsForm | null>(null);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifMessage, setNotifMessage] = useState<Message>(null);

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
          // Migration support: handle both old and new field names
          studyProgram: userData.studyProgram || userData.program || "",
          graduationYear:
            userData.graduationYear ||
            (typeof userData.expectedGraduation === "string"
              ? parseInt(userData.expectedGraduation) || currentYear + 4
              : currentYear + 4),
        };
        const notifications: NotificationsForm = {
          emailNotifications: userData.emailNotifications ?? false,
          notificationDaysBefore: userData.notificationDaysBefore ?? 1,
          email: userData.email || "",
        };

        setProfileForm(profile);
        setSavedProfile(profile);
        setNotifForm(notifications);
        setSavedNotif(notifications);
        setPrefs({
          showDaysTillDue: userData.showDaysTillDue ?? true,
          showWeight: userData.showWeight ?? true,
          showNotes: userData.showNotes ?? true,
          showStatsBar: userData.showStatsBar ?? false,
        });
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
        updatedAt: new Date(),
      });
      setSavedNotif(notifForm);
      setNotifMessage({ text: "Notification settings updated", type: "success" });
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
          <NotificationsSection form={notifForm} onChange={setNotifField} />
          <SettingsMessage text={notifMessage?.text ?? ""} type={notifMessage?.type ?? "success"} />
          <SettingsActions dirty={isDirty(notifForm, savedNotif)} saving={notifSaving} />
        </form>
      </section>
    </div>
  );
};

export default UserSettings;
