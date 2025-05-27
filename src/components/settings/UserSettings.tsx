// components/UserSettings.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ProfileSection from "./ProfileSection";
import PreferencesSection from "./PreferencesSection";
import NotificationsSection from "./NotificationsSection";
import SettingsHeader from "./SettingsHeader";
import SettingsNavigation from "./SettingsNavigation";
import SettingsActions from "./SettingsActions";
import SettingsMessage from "./SettingsMessage";
import { useTheme } from "../../contexts/ThemeContext";

interface UserSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserSettings = ({ isOpen, onClose }: UserSettingsProps) => {
  const { user } = useAuth();
  const { isDarkMode, setDarkMode } = useTheme();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [institution, setInstitution] = useState("");
  const [studyProgram, setStudyProgram] = useState("");
  const [graduationYear, setGraduationYear] = useState<number>(
    new Date().getFullYear() + 4
  );
  const [showDaysTillDue, setShowDaysTillDue] = useState<boolean>(true);
  const [showWeight, setShowWeight] = useState<boolean>(true);
  const [showNotes, setShowNotes] = useState<boolean>(true);
  const [showStatsBar, setShowStatsBar] = useState<boolean>(false);
  const [isDarkModeLocal, setIsDarkModeLocal] = useState(isDarkMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  }>({ text: "", type: "success" });
  const [imagePreview, setImagePreview] = useState<string | null>(
    user?.photoURL || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<
    "profile" | "preferences" | "notifications"
  >("profile");

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState<boolean>(false);
  const [notificationDaysBefore, setNotificationDaysBefore] =
    useState<number>(1);
  const [email, setEmail] = useState<string>("");
  const [hasConsentedToNotifications, setHasConsentedToNotifications] =
    useState<boolean>(false);

  // Store initial values for comparison
  const [initialValues, setInitialValues] = useState({
    displayName: "",
    institution: "",
    studyProgram: "",
    graduationYear: 0,
    showDaysTillDue: true,
    showWeight: true,
    showNotes: true,
    showStatsBar: false,
    photoURL: null as string | null,
    isDarkMode: false,
    emailNotifications: false,
    notificationDaysBefore: 1,
    email: "",
    hasConsentedToNotifications: false,
  });

  // Current year for graduation year input
  const currentYear = new Date().getFullYear();

  // Check if there are any changes
  const hasChanges = () => {
    return (
      displayName !== initialValues.displayName ||
      institution !== initialValues.institution ||
      studyProgram !== initialValues.studyProgram ||
      graduationYear !== initialValues.graduationYear ||
      showDaysTillDue !== initialValues.showDaysTillDue ||
      showWeight !== initialValues.showWeight ||
      showNotes !== initialValues.showNotes ||
      showStatsBar !== initialValues.showStatsBar ||
      imageFile !== null ||
      imagePreview !== initialValues.photoURL ||
      isDarkModeLocal !== initialValues.isDarkMode ||
      emailNotifications !== initialValues.emailNotifications ||
      notificationDaysBefore !== initialValues.notificationDaysBefore ||
      email !== initialValues.email ||
      hasConsentedToNotifications !== initialValues.hasConsentedToNotifications
    );
  };

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const newInstitution = userData.institution || "";
          const newStudyProgram = userData.studyProgram || "";
          const newGraduationYear = userData.graduationYear || currentYear + 4;
          const newShowDaysTillDue = userData.showDaysTillDue ?? true;
          const newShowWeight = userData.showWeight ?? true;
          const newShowNotes = userData.showNotes ?? true;
          const newShowStatsBar = userData.showStatsBar ?? false;
          const newEmailNotifications = userData.emailNotifications ?? false;
          const newNotificationDaysBefore =
            userData.notificationDaysBefore ?? 1;
          const newEmail = userData.email || "";
          const newHasConsentedToNotifications =
            userData.hasConsentedToNotifications ?? false;

          // Set current values
          setInstitution(newInstitution);
          setStudyProgram(newStudyProgram);
          setGraduationYear(newGraduationYear);
          setShowDaysTillDue(newShowDaysTillDue);
          setShowWeight(newShowWeight);
          setShowNotes(newShowNotes);
          setShowStatsBar(newShowStatsBar);
          setIsDarkModeLocal(isDarkMode);
          setEmailNotifications(newEmailNotifications);
          setNotificationDaysBefore(newNotificationDaysBefore);
          setEmail(newEmail);
          setHasConsentedToNotifications(newHasConsentedToNotifications);

          // Set initial values
          setInitialValues({
            displayName: user.displayName || "",
            institution: newInstitution,
            studyProgram: newStudyProgram,
            graduationYear: newGraduationYear,
            showDaysTillDue: newShowDaysTillDue,
            showWeight: newShowWeight,
            showNotes: newShowNotes,
            showStatsBar: newShowStatsBar,
            photoURL: user.photoURL,
            isDarkMode: isDarkMode,
            emailNotifications: newEmailNotifications,
            notificationDaysBefore: newNotificationDaysBefore,
            email: newEmail,
            hasConsentedToNotifications: newHasConsentedToNotifications,
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user, currentYear, isDarkMode]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate email if notifications are enabled
    if (emailNotifications && email && !isValidEmail(email)) {
      setMessage({
        text: "Please enter a valid email address",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: "", type: "success" });

    try {
      // Update profile data in Firebase Auth
      const updates: { displayName?: string; photoURL?: string } = {};

      if (displayName !== initialValues.displayName) {
        updates.displayName = displayName;
      }

      // Upload image if a new one was selected
      if (imageFile) {
        const storage = getStorage();
        const storageRef = ref(storage, `profile-images/${user.uid}`);
        await uploadBytes(storageRef, imageFile);
        const downloadURL = await getDownloadURL(storageRef);
        updates.photoURL = downloadURL;
      }

      // Update profile if there are any auth updates
      if (Object.keys(updates).length > 0) {
        await updateProfile(user, updates);
      }

      // Update user data in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: displayName,
        institution: institution,
        studyProgram: studyProgram,
        graduationYear: graduationYear,
        showDaysTillDue: showDaysTillDue,
        showWeight: showWeight,
        showNotes: showNotes,
        showStatsBar: showStatsBar,
        emailNotifications: emailNotifications,
        notificationDaysBefore: notificationDaysBefore,
        email: email,
        hasConsentedToNotifications: hasConsentedToNotifications,
        updatedAt: new Date(),
      });

      // Update dark mode if changed
      if (isDarkModeLocal !== initialValues.isDarkMode) {
        setDarkMode(isDarkModeLocal);
      }

      // Update initial values to match current values
      setInitialValues({
        displayName,
        institution,
        studyProgram,
        graduationYear,
        showDaysTillDue,
        showWeight,
        showNotes,
        showStatsBar,
        photoURL: imageFile
          ? await getDownloadURL(
              ref(getStorage(), `profile-images/${user.uid}`)
            )
          : imagePreview,
        isDarkMode: isDarkModeLocal,
        emailNotifications,
        notificationDaysBefore,
        email,
        hasConsentedToNotifications,
      });

      // Reset image file
      setImageFile(null);

      // Trigger a custom event to notify other components of the preference change
      const event = new CustomEvent("userPreferencesUpdated", {
        detail: {
          showDaysTillDue,
          showWeight,
          showNotes,
          showStatsBar,
          emailNotifications,
          notificationDaysBefore,
        },
      });
      window.dispatchEvent(event);

      setMessage({
        text: "Settings updated successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        text: "Failed to update settings. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    // Reset all values to initial state
    setDisplayName(initialValues.displayName);
    setInstitution(initialValues.institution);
    setStudyProgram(initialValues.studyProgram);
    setGraduationYear(initialValues.graduationYear);
    setShowDaysTillDue(initialValues.showDaysTillDue);
    setShowWeight(initialValues.showWeight);
    setShowNotes(initialValues.showNotes);
    setShowStatsBar(initialValues.showStatsBar);
    setImagePreview(initialValues.photoURL);
    setImageFile(null);
    setIsDarkModeLocal(initialValues.isDarkMode);
    setEmailNotifications(initialValues.emailNotifications);
    setNotificationDaysBefore(initialValues.notificationDaysBefore);
    setEmail(initialValues.email);
    setHasConsentedToNotifications(initialValues.hasConsentedToNotifications);
    onClose();
  };

  // Function to validate email format
  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  if (!isOpen) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <SettingsHeader onClose={onClose} />
      <SettingsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-dark-bg-primary rounded-2xl shadow-sm p-6"
      >
        {activeTab === "profile" ? (
          <ProfileSection
            displayName={displayName}
            setDisplayName={setDisplayName}
            institution={institution}
            setInstitution={setInstitution}
            studyProgram={studyProgram}
            setStudyProgram={setStudyProgram}
            graduationYear={graduationYear}
            setGraduationYear={setGraduationYear}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            setImageFile={setImageFile}
            setMessage={setMessage}
          />
        ) : activeTab === "preferences" ? (
          <PreferencesSection
            showDaysTillDue={showDaysTillDue}
            setShowDaysTillDue={setShowDaysTillDue}
            showWeight={showWeight}
            setShowWeight={setShowWeight}
            showNotes={showNotes}
            setShowNotes={setShowNotes}
            showStatsBar={showStatsBar}
            setShowStatsBar={setShowStatsBar}
            isDarkMode={isDarkModeLocal}
            setIsDarkMode={setIsDarkModeLocal}
          />
        ) : (
          <NotificationsSection
            emailNotifications={emailNotifications}
            setEmailNotifications={setEmailNotifications}
            notificationDaysBefore={notificationDaysBefore}
            setNotificationDaysBefore={setNotificationDaysBefore}
            email={email}
            setEmail={setEmail}
            hasConsentedToNotifications={hasConsentedToNotifications}
            setHasConsentedToNotifications={setHasConsentedToNotifications}
          />
        )}

        <SettingsMessage text={message.text} type={message.type} />
        <SettingsActions
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          hasChanges={hasChanges()}
          isSubmitting={isSubmitting}
        />
      </form>
    </div>
  );
};

export default UserSettings;
