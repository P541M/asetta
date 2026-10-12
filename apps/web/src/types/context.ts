import { User } from "firebase/auth";
import { OnboardingStatus, UserDocError } from "@/utils/userDoc";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  /** Why the signed-in user's doc couldn't be loaded; `_app` shows LoadErrorScreen for it. */
  userDocError: UserDocError | null;
  onboardingStatus: OnboardingStatus | null;
  onboardingLoading: boolean;
  refreshOnboardingStatus: () => Promise<void>;
  logout: () => Promise<void>;
}
