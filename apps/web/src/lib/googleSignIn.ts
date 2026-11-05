import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase";
import { getAuthErrorMessage } from "../utils/authErrors";

interface AuthFormState {
  setError: (message: string | null) => void;
  setIsSubmitting: (submitting: boolean) => void;
}

/**
 * The Google button on the sign-in and sign-up forms. On success the form keeps showing progress
 * until useRedirectAfterAuth moves on; a closed popup has no message, so it shows nothing.
 */
export async function signInWithGoogle({ setError, setIsSubmitting }: AuthFormState) {
  setError(null);
  setIsSubmitting(true);
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
  } catch (error: unknown) {
    const message = getAuthErrorMessage(
      error,
      "Something went wrong with Google sign-in. Please try again.",
    );
    if (message) setError(message);
    setIsSubmitting(false);
  }
}
