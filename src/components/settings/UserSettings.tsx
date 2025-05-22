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
  const [activeTab, setActiveTab] = useState<"profile" | "preferences">(
    "profile"
  );

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
      isDarkModeLocal !== initialValues.isDarkMode
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

          // Set current values
          setInstitution(newInstitution);
          setStudyProgram(newStudyProgram);
          setGraduationYear(newGraduationYear);
          setShowDaysTillDue(newShowDaysTillDue);
          setShowWeight(newShowWeight);
          setShowNotes(newShowNotes);
          setShowStatsBar(newShowStatsBar);
          setIsDarkModeLocal(isDarkMode);

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
      });

      // Reset image file
      setImageFile(null);

      // Trigger a custom event to notify other components of the preference change
      const event = new CustomEvent("userPreferencesUpdated", {
        detail: { showDaysTillDue, showWeight, showNotes, showStatsBar },
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
            Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-tertiary">
            Manage your account settings and preferences
          </p>
        </div>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-500 dark:text-dark-text-tertiary dark:hover:text-dark-text-secondary transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
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

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-dark-border mb-8">
        <nav className="flex">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
              activeTab === "profile"
                ? "border-primary-500 text-primary-600 dark:text-primary-400 dark:border-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-dark-text-tertiary dark:hover:text-dark-text-secondary"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
              activeTab === "preferences"
                ? "border-primary-500 text-primary-600 dark:text-primary-400 dark:border-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-dark-text-tertiary dark:hover:text-dark-text-secondary"
            }`}
          >
            Preferences
          </button>
        </nav>
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit}>
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
        ) : (
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
        )}

        {/* Status Message */}
        {message.text && (
          <div
            className={`mt-4 p-4 rounded-md ${
              message.type === "success"
                ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-border flex justify-end">
          {hasChanges() && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserSettings;
