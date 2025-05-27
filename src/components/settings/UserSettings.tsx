// components/UserSettings.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ProfileSection from "./ProfileSection";
import PreferencesSection from "./PreferencesSection";
import { useTheme } from "../../contexts/ThemeContext";
import { isValidEmail, isValidPhoneNumber } from "../../lib/notifications";
import NotificationsSection from "./NotificationsSection";

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
  const [message, setMessage] = useState({ text: "", type: "" });
  const [imagePreview, setImagePreview] = useState<string | null>(
    user?.photoURL || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<
    "profile" | "preferences" | "notifications"
  >("profile");

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState<boolean>(false);
  const [smsNotifications, setSmsNotifications] = useState<boolean>(false);
  const [notificationDaysBefore, setNotificationDaysBefore] =
    useState<number>(1);
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
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
    smsNotifications: false,
    notificationDaysBefore: 1,
    email: "",
    phoneNumber: "",
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
      smsNotifications !== initialValues.smsNotifications ||
      notificationDaysBefore !== initialValues.notificationDaysBefore ||
      email !== initialValues.email ||
      phoneNumber !== initialValues.phoneNumber ||
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
          const newSmsNotifications = userData.smsNotifications ?? false;
          const newNotificationDaysBefore =
            userData.notificationDaysBefore ?? 1;
          const newEmail = userData.email || "";
          const newPhoneNumber = userData.phoneNumber || "";
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
          setSmsNotifications(newSmsNotifications);
          setNotificationDaysBefore(newNotificationDaysBefore);
          setEmail(newEmail);
          setPhoneNumber(newPhoneNumber);
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
            smsNotifications: newSmsNotifications,
            notificationDaysBefore: newNotificationDaysBefore,
            email: newEmail,
            phoneNumber: newPhoneNumber,
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

    // Validate email and phone number if notifications are enabled
    if (emailNotifications && email && !isValidEmail(email)) {
      setMessage({
        text: "Please enter a valid email address",
        type: "error",
      });
      return;
    }

    if (smsNotifications && phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      setMessage({
        text: "Please enter a valid phone number",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

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
        smsNotifications: smsNotifications,
        notificationDaysBefore: notificationDaysBefore,
        email: email,
        phoneNumber: phoneNumber,
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
        smsNotifications,
        notificationDaysBefore,
        email,
        phoneNumber,
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
          smsNotifications,
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
    setSmsNotifications(initialValues.smsNotifications);
    setNotificationDaysBefore(initialValues.notificationDaysBefore);
    setEmail(initialValues.email);
    setPhoneNumber(initialValues.phoneNumber);
    setHasConsentedToNotifications(initialValues.hasConsentedToNotifications);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold  text-primary-600 ">Settings</h2>
          <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mt-1">
            Manage your account settings and preferences
          </p>
        </div>
        <button
          onClick={handleCancel}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg-secondary transition-colors"
          aria-label="Close settings"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-400 hover:text-gray-500 dark:text-dark-text-tertiary dark:hover:text-dark-text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-1 shadow-md mb-8">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 px-6 py-3 font-medium text-sm transition-all duration-200 rounded-lg ${
              activeTab === "profile"
                ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm"
                : "text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Profile</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`flex-1 px-6 py-3 font-medium text-sm transition-all duration-200 rounded-lg ${
              activeTab === "preferences"
                ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm"
                : "text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Preferences</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex-1 px-6 py-3 font-medium text-sm transition-all duration-200 rounded-lg ${
              activeTab === "notifications"
                ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm"
                : "text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Notifications</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
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
            smsNotifications={smsNotifications}
            setSmsNotifications={setSmsNotifications}
            notificationDaysBefore={notificationDaysBefore}
            setNotificationDaysBefore={setNotificationDaysBefore}
            email={email}
            setEmail={setEmail}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            hasConsentedToNotifications={hasConsentedToNotifications}
            setHasConsentedToNotifications={setHasConsentedToNotifications}
          />
        )}

        {/* Status Message */}
        {message.text && (
          <div
            className={`mt-6 p-4 rounded-xl ${
              message.type === "success"
                ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!hasChanges() || isSubmitting}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 ${
              hasChanges() && !isSubmitting
                ? "bg-primary-600 hover:bg-primary-700 shadow-sm hover:shadow"
                : "bg-gray-300 dark:bg-dark-bg-tertiary cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserSettings;
