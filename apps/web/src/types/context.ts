import { User } from "firebase/auth";
import { DisplayPreferences, OnboardingStatus, UserDocError, UserProfile } from "@/utils/userDoc";

export interface AuthContextType {
  user: User | null;
  /** True until the session is restored and, when signed in, the user doc has loaded. */
  loading: boolean;
  /** Why the signed-in user's doc couldn't be loaded; the pages that need it show LoadErrorScreen. */
  userDocError: UserDocError | null;
  /** Null while signed out, loading, or when the user doc couldn't be loaded. */
  onboardingStatus: OnboardingStatus | null;
  profile: UserProfile;
  displayPreferences: DisplayPreferences;
  logout: () => Promise<void>;
}
