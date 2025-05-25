export interface ProfileSectionProps {
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
