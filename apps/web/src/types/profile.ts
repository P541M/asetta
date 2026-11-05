import type { UserProfile } from "../utils/userDoc";

export interface ProfileSectionProps {
  form: UserProfile;
  onChange: <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => void;
}
