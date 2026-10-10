export interface ProfileForm {
  displayName: string;
  institution: string;
}

export interface ProfileSectionProps {
  form: ProfileForm;
  onChange: <K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) => void;
}
