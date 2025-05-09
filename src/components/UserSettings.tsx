// components/UserSettings.tsx
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from "next/image";

interface UserSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

// Add a loader function for profile images
const profileImageLoader = ({ src }: { src: string }) => {
  // Return the URL directly if it's a data URL (for image previews)
  if (src.startsWith("data:")) {
    return src;
  }
  // Return the URL directly if it's already a full URL
  if (src.startsWith("http")) {
    return src;
  }
  // Add your default avatar URL here if needed
  return `/default-avatar.png`;
};

const UserSettings = ({ isOpen, onClose }: UserSettingsProps) => {
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "preferences">(
    "profile"
  );

  // Current year for graduation year input
  const currentYear = new Date().getFullYear();

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

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

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setMessage({
          text: "Image size should be less than 2MB",
          type: "error",
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        setMessage({
          text: "Please select an image file",
          type: "error",
        });
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle triggering file input click
  const handleChooseImage = () => {
    fileInputRef.current?.click();
  };

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

  // Replace handleDarkModeToggle with the one from context
  const handleDarkModeToggle = () => {
    toggleDarkMode();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-dark-bg-primary rounded-lg shadow-xl w-full max-w-md animate-scale"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">
              User Settings
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-dark-text-tertiary dark:hover:text-dark-text-secondary"
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
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-dark-border mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`${
                    activeTab === "profile"
                      ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-dark-text-tertiary dark:hover:text-dark-text-secondary"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab("preferences")}
                  className={`${
                    activeTab === "preferences"
                      ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-dark-text-tertiary dark:hover:text-dark-text-secondary"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Preferences
                </button>
              </nav>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {activeTab === "profile" ? (
                <>
                  {/* Profile picture */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 mb-2">
                        {imagePreview ? (
                          <div className="relative h-24 w-24">
                            <Image
                              src={imagePreview}
                              alt="Profile"
                              width={96}
                              height={96}
                              className="object-cover"
                              loader={profileImageLoader}
                            />
                          </div>
                        ) : (
                          <div className="h-full w-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-12 w-12"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleChooseImage}
                        className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1 rounded-full shadow hover:bg-indigo-700 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      className="hidden"
                      accept="image/*"
                    />
                    <button
                      type="button"
                      onClick={handleChooseImage}
                      className="text-sm text-indigo-600 hover:text-indigo-800 mt-1"
                    >
                      Change profile picture
                    </button>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-4">
                    <div className="form-group">
                      <label
                        htmlFor="displayName"
                        className="form-label dark:text-dark-text-primary"
                      >
                        Display Name
                      </label>
                      <input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="input hover:shadow-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border"
                        placeholder="Your name"
                      />
                    </div>

                    <div className="form-group">
                      <label
                        htmlFor="institution"
                        className="form-label dark:text-dark-text-primary"
                      >
                        Institution
                      </label>
                      <input
                        id="institution"
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="input hover:shadow-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border"
                        placeholder="Your university or school"
                      />
                    </div>

                    <div className="form-group">
                      <label
                        htmlFor="studyProgram"
                        className="form-label dark:text-dark-text-primary"
                      >
                        Study Program
                      </label>
                      <input
                        id="studyProgram"
                        type="text"
                        value={studyProgram}
                        onChange={(e) => setStudyProgram(e.target.value)}
                        className="input hover:shadow-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border"
                        placeholder="Your field of study"
                      />
                    </div>

                    <div className="form-group">
                      <label
                        htmlFor="graduationYear"
                        className="form-label dark:text-dark-text-primary"
                      >
                        Expected Graduation Year
                      </label>
                      <input
                        id="graduationYear"
                        type="number"
                        min={currentYear}
                        max={currentYear + 10}
                        value={graduationYear}
                        onChange={(e) =>
                          setGraduationYear(parseInt(e.target.value))
                        }
                        className="input hover:shadow-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border"
                        placeholder="e.g., 2027"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {/* Dark Mode Toggle */}
                  <div className="form-group">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="darkMode"
                        className="form-label dark:text-dark-text-primary font-medium"
                      >
                        Dark Mode
                      </label>
                      <button
                        type="button"
                        onClick={handleDarkModeToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                          isDarkMode
                            ? "bg-indigo-600"
                            : "bg-gray-200 dark:bg-dark-bg-tertiary"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isDarkMode ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mt-1">
                      Toggle between light and dark mode appearance
                    </p>
                  </div>

                  {/* Show Days Till Due Toggle */}
                  <div className="form-group">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="showDaysTillDue"
                        className="form-label dark:text-dark-text-primary font-medium"
                      >
                        Show Days Till Due
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowDaysTillDue(!showDaysTillDue)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                          showDaysTillDue
                            ? "bg-indigo-600"
                            : "bg-gray-200 dark:bg-dark-bg-tertiary"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            showDaysTillDue ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mt-1">
                      Toggle the display of days remaining until due date in the
                      assessments table
                    </p>
                  </div>

                  {/* Show Weight Toggle */}
                  <div className="form-group">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="showWeight"
                        className="form-label dark:text-dark-text-primary font-medium"
                      >
                        Show Weight Column
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowWeight(!showWeight)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                          showWeight
                            ? "bg-indigo-600"
                            : "bg-gray-200 dark:bg-dark-bg-tertiary"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            showWeight ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mt-1">
                      Toggle the display of the weight column in the assessments
                      table
                    </p>
                  </div>

                  {/* Show Stats Bar Toggle */}
                  <div className="form-group">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="showStatsBar"
                        className="form-label dark:text-dark-text-primary font-medium"
                      >
                        Show Stats Bar
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowStatsBar(!showStatsBar)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                          showStatsBar
                            ? "bg-indigo-600"
                            : "bg-gray-200 dark:bg-dark-bg-tertiary"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            showStatsBar ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mt-1">
                      Toggle the display of the statistics bar above the
                      assessments table
                    </p>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-outline mr-2 dark:border-dark-border dark:text-dark-text-primary dark:hover:bg-dark-bg-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`btn-primary px-6 ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>

              {/* Status message */}
              {message.text && (
                <div
                  className={`mt-4 p-3 rounded-lg text-sm ${
                    message.type === "error"
                      ? "bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30"
                  } animate-fade`}
                >
                  {message.type === "error" ? (
                    <div className="flex items-start">
                      <svg
                        className="h-5 w-5 mr-2 mt-0.5 text-red-500 dark:text-red-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 00-1.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{message.text}</span>
                    </div>
                  ) : (
                    <div className="flex items-start">
                      <svg
                        className="h-5 w-5 mr-2 mt-0.5 text-emerald-500 dark:text-emerald-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{message.text}</span>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
