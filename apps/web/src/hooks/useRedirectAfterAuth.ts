import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import { pathAfterAuth } from "../utils/userDoc";

/**
 * Sends a signed-in visitor on from the sign-in pages once useAuth has the user doc, which it
 * reads live, so the pages read nothing of their own (A54). Also runs after a successful submit:
 * the form keeps showing progress until then.
 */
export function useRedirectAfterAuth() {
  const { user, loading, onboardingStatus } = useAuth();
  const router = useRouter();
  const destination = user && !loading ? pathAfterAuth(onboardingStatus) : null;

  useEffect(() => {
    if (destination) router.push(destination);
  }, [destination, router]);
}
