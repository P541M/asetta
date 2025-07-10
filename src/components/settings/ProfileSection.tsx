import { useRef } from "react";
import Image from "next/image";
import { ProfileSectionProps } from "../../types/profile";

const ProfileSection = ({
  displayName,
  setDisplayName,
  institution,
  setInstitution,
  studyProgram,
  setStudyProgram,
  graduationYear,
  setGraduationYear,
  imagePreview,
  setImagePreview,
  setImageFile,
  setMessage,
}: ProfileSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentYear = new Date().getFullYear();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 2 * 1024 * 1024) {
        setMessage({
          text: "Image size should be less than 2MB",
          type: "error",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        setMessage({
          text: "Please select an image file",
          type: "error",
        });
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChooseImage = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-8">
      {/* Profile Picture */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-dark-bg-secondary">
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Profile"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-dark-text-tertiary">
                <svg
                  className="w-16 h-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
          </div>
          <label
            htmlFor="profile-picture"
            className="absolute bottom-0 right-0 p-2 bg-light-button-primary dark:bg-dark-button-primary text-white rounded-full cursor-pointer hover:bg-light-button-primary-hover dark:hover:bg-dark-button-primary-hover transition-colors shadow-lg"
            onClick={handleChooseImage}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </label>
          <input
            id="profile-picture"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>
        <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
          Click the camera icon to change your profile picture
        </p>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label
            htmlFor="displayName"
            className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary"
          >
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-dark-input-border rounded-xl shadow-sm focus:ring-2 focus:ring-light-focus-ring dark:focus:ring-dark-focus-ring focus:border-light-focus-ring dark:focus:border-dark-focus-ring dark:bg-dark-input-bg dark:text-dark-input-text transition-all duration-200"
            placeholder="Your name"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="institution"
            className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary"
          >
            Institution
          </label>
          <input
            id="institution"
            type="text"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-dark-input-border rounded-xl shadow-sm focus:ring-2 focus:ring-light-focus-ring dark:focus:ring-dark-focus-ring focus:border-light-focus-ring dark:focus:border-dark-focus-ring dark:bg-dark-input-bg dark:text-dark-input-text transition-all duration-200"
            placeholder="Your university or school"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="studyProgram"
            className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary"
          >
            Study Program
          </label>
          <input
            id="studyProgram"
            type="text"
            value={studyProgram}
            onChange={(e) => setStudyProgram(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-dark-input-border rounded-xl shadow-sm focus:ring-2 focus:ring-light-focus-ring dark:focus:ring-dark-focus-ring focus:border-light-focus-ring dark:focus:border-dark-focus-ring dark:bg-dark-input-bg dark:text-dark-input-text transition-all duration-200"
            placeholder="Your study program"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="graduationYear"
            className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary"
          >
            Expected Graduation Year
          </label>
          <input
            id="graduationYear"
            type="number"
            min={currentYear}
            max={currentYear + 10}
            value={graduationYear}
            onChange={(e) => setGraduationYear(parseInt(e.target.value))}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-dark-input-border rounded-xl shadow-sm focus:ring-2 focus:ring-light-focus-ring dark:focus:ring-dark-focus-ring focus:border-light-focus-ring dark:focus:border-dark-focus-ring dark:bg-dark-input-bg dark:text-dark-input-text transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
