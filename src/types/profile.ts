export interface ProfileForm {
  displayName: string;
  institution: string;
  studyProgram: string;
  graduationYear: number;
}

export interface ProfileSectionProps {
  form: ProfileForm;
  onChange: <K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) => void;
}
