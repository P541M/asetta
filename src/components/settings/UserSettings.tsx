// components/UserSettings.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ProfileSection from "./ProfileSection";
import PreferencesSection from "./PreferencesSection";

interface UserSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserSettings = ({ isOpen, onClose }: UserSettingsProps) => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [institution, setInstitution] = useState("");
  const [studyProgram, setStudyProgram] = useState("");
  const [graduationYear, setGraduationYear] = useState<number>(
    new Date().getFullYear() + 4
  );
  const [showDaysTillDue, setShowDaysTillDue] = useState<boolean>(true);
  const [showWeight, setShowWeight] = useState<boolean>(true);
  const [showStatsBar, setShowStatsBar] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [imagePreview, setImagePreview] = useState<string | null>(
    user?.photoURL || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "preferences">(
    "profile"
  );

  // Current year for graduation year input
  const currentYear = new Date().getFullYear();

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setInstitution(userData.institution || "");
          setStudyProgram(userData.studyProgram || "");
          setGraduationYear(userData.graduationYear || currentYear + 4);
          setShowDaysTillDue(userData.showDaysTillDue ?? true);
          setShowWeight(userData.showWeight ?? true);
          setShowStatsBar(userData.showStatsBar ?? false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user, currentYear]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      // Update profile data in Firebase Auth
      const updates: { displayName?: string; photoURL?: string } = {};

      if (displayName !== user.displayName) {
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
        showStatsBar: showStatsBar,
        updatedAt: new Date(),
      });

      // Trigger a custom event to notify other components of the preference change
      const event = new CustomEvent("userPreferencesUpdated", {
        detail: { showDaysTillDue, showWeight, showStatsBar },
      });
      window.dispatchEvent(event);

      setMessage({
        text: "Profile updated successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        text: "Failed to update profile. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          onClick={onClose}
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
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-dark-text-tertiary dark:hover:text-dark-text-secondary"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
              activeTab === "preferences"
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
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
            showStatsBar={showStatsBar}
            setShowStatsBar={setShowStatsBar}
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
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-border flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-primary hover:text-gray-900 dark:hover:text-dark-text-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserSettings;
