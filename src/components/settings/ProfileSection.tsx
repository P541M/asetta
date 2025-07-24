import { ProfileSectionProps } from "../../types/profile";
import Avatar from "../ui/Avatar";
import EmojiPicker from "../ui/EmojiPicker";

const ProfileSection = ({
  displayName,
  setDisplayName,
  institution,
  setInstitution,
  studyProgram,
  setStudyProgram,
  graduationYear,
  setGraduationYear,
  avatarEmoji,
  setAvatarEmoji,
}: ProfileSectionProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-b border-light-border-primary dark:border-dark-border-primary pb-4">
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
          Profile Information
        </h3>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
          Update your profile details and emoji avatar
        </p>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar size="lg" emoji={avatarEmoji} className="shadow-lg" />
          <div className="text-center">
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Your profile emoji
            </p>
            <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
              Choose an emoji to represent yourself
            </p>
          </div>
        </div>

        {/* Emoji Picker */}
        <div className="w-full max-w-sm">
          <EmojiPicker
            selectedEmoji={avatarEmoji}
            onEmojiSelect={setAvatarEmoji}
            variant="inline"
            className="w-full"
          />
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
