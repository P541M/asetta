export interface ProfileSectionProps {
  displayName: string;
  setDisplayName: (name: string) => void;
  institution: string;
  setInstitution: (institution: string) => void;
  studyProgram: string;
  setStudyProgram: (program: string) => void;
  graduationYear: number;
  setGraduationYear: (year: number) => void;
  avatarEmoji: string;
  setAvatarEmoji: (emoji: string) => void;
  // Legacy support for existing color system
  avatarColor?: "blue" | "green" | "purple" | "orange" | "red" | "pink" | "indigo" | "teal";
  setAvatarColor?: (color: "blue" | "green" | "purple" | "orange" | "red" | "pink" | "indigo" | "teal") => void;
}
