import { useRef } from "react";
import Image from "next/image";

interface ProfileSectionProps {
  displayName: string;
  setDisplayName: (name: string) => void;
  institution: string;
  setInstitution: (institution: string) => void;
  studyProgram: string;
  setStudyProgram: (program: string) => void;
  graduationYear: number;
  setGraduationYear: (year: number) => void;
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
  setImageFile: (file: File | null) => void;
  setMessage: (message: { text: string; type: string }) => void;
}

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
      {/* Profile Picture Section */}
      <div className="flex flex-col items-center">
        <div className="relative group">
          <div className="h-40 w-40 rounded-full overflow-hidden bg-gray-100 dark:bg-dark-bg-tertiary ring-4 ring-white dark:ring-dark-bg-secondary shadow-lg">
            {imagePreview ? (
              <div className="relative h-40 w-40">
                <Image
                  src={imagePreview}
                  alt="Profile"
                  width={160}
                  height={160}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-full w-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-20 w-20"
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
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity rounded-full flex items-center justify-center">
              <button
                type="button"
                onClick={handleChooseImage}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-dark-bg-secondary text-gray-700 dark:text-dark-text-primary p-3 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-dark-hover-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            className="hidden"
            accept="image/*"
          />
        </div>
        <button
          type="button"
          onClick={handleChooseImage}
          className="mt-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
        >
          Change profile picture
        </button>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-input-border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-input-bg dark:text-dark-input-text transition-colors"
            placeholder="Your name"
          />
        </div>

        <div className="space-y-1">
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-input-border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-input-bg dark:text-dark-input-text transition-colors"
            placeholder="Your university or school"
          />
        </div>

        <div className="space-y-1">
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-input-border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-input-bg dark:text-dark-input-text transition-colors"
            placeholder="Your field of study"
          />
        </div>

        <div className="space-y-1">
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-input-border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-input-bg dark:text-dark-input-text transition-colors"
            placeholder="e.g., 2027"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
