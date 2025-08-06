export interface ProfileSectionProps {
  displayName: string;
  setDisplayName: (name: string) => void;
  institution: string;
  setInstitution: (institution: string) => void;
  studyProgram: string;
  setStudyProgram: (program: string) => void;
  graduationYear: number;
  setGraduationYear: (year: number) => void;
  avatarIconId: string;
  setAvatarIconId: (iconId: string) => void;
}
