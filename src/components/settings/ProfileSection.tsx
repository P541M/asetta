import { ProfileSectionProps } from "../../types/profile";
import Avatar from "../ui/Avatar";

const ProfileSection = ({
  displayName,
  setDisplayName,
  institution,
  setInstitution,
  studyProgram,
  setStudyProgram,
  graduationYear,
  setGraduationYear,
  avatarColor,
  setAvatarColor,
}: ProfileSectionProps) => {
  const currentYear = new Date().getFullYear();

  const colorOptions: Array<{
    value: "blue" | "green" | "purple" | "orange" | "red" | "pink" | "indigo" | "teal";
    label: string;
    bgColor: string;
  }> = [
    { value: "blue", label: "Blue", bgColor: "bg-blue-500" },
    { value: "green", label: "Green", bgColor: "bg-green-500" },
    { value: "purple", label: "Purple", bgColor: "bg-purple-500" },
    { value: "orange", label: "Orange", bgColor: "bg-orange-500" },
    { value: "red", label: "Red", bgColor: "bg-red-500" },
    { value: "pink", label: "Pink", bgColor: "bg-pink-500" },
    { value: "indigo", label: "Indigo", bgColor: "bg-indigo-500" },
    { value: "teal", label: "Teal", bgColor: "bg-teal-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-b border-light-border-primary dark:border-dark-border-primary pb-4">
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
          Profile Information
        </h3>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
          Update your profile details and avatar color
        </p>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar size="lg" color={avatarColor} className="shadow-lg" />
          <div className="text-center">
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Your avatar color
            </p>
            <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
              Choose from the colors below to personalize your avatar
            </p>
          </div>
        </div>

        {/* Color Picker */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary text-center">
            Avatar Color
          </label>
          <div className="flex flex-wrap justify-center gap-3">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setAvatarColor(color.value)}
                className={`group relative w-12 h-12 rounded-full border-3 transition-all duration-200 hover:scale-110 ${
                  avatarColor === color.value
                    ? "border-light-button-primary dark:border-dark-button-primary shadow-lg"
                    : "border-light-border-primary dark:border-dark-border-primary hover:border-light-button-primary dark:hover:border-dark-button-primary"
                }`}
                aria-label={`Select ${color.label} color`}
              >
                <div className="w-full h-full rounded-full overflow-hidden">
                  <Avatar size="md" color={color.value} className="w-full h-full" />
                </div>
                {avatarColor === color.value && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-light-button-primary dark:bg-dark-button-primary rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
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
