import { User } from "firebase/auth";
import { OnboardingStatus } from "@/utils/onboardingUtils";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  onboardingStatus: OnboardingStatus | null;
  onboardingLoading: boolean;
  refreshOnboardingStatus: () => Promise<void>;
  logout: () => Promise<void>;
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}
