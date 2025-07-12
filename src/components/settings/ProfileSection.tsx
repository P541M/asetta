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
      {/* Section Header */}
      <div className="border-b border-light-border-primary dark:border-dark-border-primary pb-4">
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
          Profile Information
        </h3>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
          Update your profile details and photo
        </p>
      </div>

      {/* Profile Picture */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-light-bg-tertiary dark:bg-dark-bg-tertiary border-4 border-light-border-primary dark:border-dark-border-primary shadow-lg group-hover:shadow-xl transition-shadow duration-200">
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Profile"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-light-text-tertiary dark:text-dark-text-tertiary">
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
          <button
            type="button"
            onClick={handleChooseImage}
            className="absolute bottom-0 right-0 p-3 bg-light-button-primary dark:bg-dark-button-primary text-white rounded-full cursor-pointer hover:bg-light-button-primary-hover dark:hover:bg-dark-button-primary-hover transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            aria-label="Change profile picture"
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
          </button>
          <input
            ref={fileInputRef}
            id="profile-picture"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>
        <div className="text-center">
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Click the camera icon to upload a new photo
          </p>
          <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
            Supports JPG, PNG files up to 2MB
          </p>
        </div>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label
            htmlFor="displayName"
            className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary"
          >
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 border border-light-border-primary dark:border-dark-border-primary rounded-xl bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary shadow-sm focus:ring-2 focus:ring-light-button-primary dark:focus:ring-dark-button-primary focus:border-light-button-primary dark:focus:border-dark-button-primary transition-all duration-200 placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary"
            placeholder="Your display name"
          />
        </div>

        <div className="space-y-3">
          <label
            htmlFor="institution"
            className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary"
          >
            Institution
          </label>
          <input
            id="institution"
            type="text"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className="w-full px-4 py-3 border border-light-border-primary dark:border-dark-border-primary rounded-xl bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary shadow-sm focus:ring-2 focus:ring-light-button-primary dark:focus:ring-dark-button-primary focus:border-light-button-primary dark:focus:border-dark-button-primary transition-all duration-200 placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary"
            placeholder="Your university or school"
          />
        </div>

        <div className="space-y-3">
          <label
            htmlFor="studyProgram"
            className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary"
          >
            Study Program
          </label>
          <input
            id="studyProgram"
            type="text"
            value={studyProgram}
            onChange={(e) => setStudyProgram(e.target.value)}
            className="w-full px-4 py-3 border border-light-border-primary dark:border-dark-border-primary rounded-xl bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary shadow-sm focus:ring-2 focus:ring-light-button-primary dark:focus:ring-dark-button-primary focus:border-light-button-primary dark:focus:border-dark-button-primary transition-all duration-200 placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary"
            placeholder="e.g., Computer Science, Business Administration"
          />
        </div>

        <div className="space-y-3">
          <label
            htmlFor="graduationYear"
            className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary"
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
            className="w-full px-4 py-3 border border-light-border-primary dark:border-dark-border-primary rounded-xl bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary shadow-sm focus:ring-2 focus:ring-light-button-primary dark:focus:ring-dark-button-primary focus:border-light-button-primary dark:focus:border-dark-button-primary transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
