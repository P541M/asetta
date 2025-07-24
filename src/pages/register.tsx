import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { auth } from "../lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  User,
} from "firebase/auth";
import Link from "next/link";
import Logo from "../components/ui/Logo";
import { getUserOnboardingStatus, shouldRedirectToOnboarding } from "../utils/onboardingUtils";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const [passwordFocused, setPasswordFocused] = useState(false);
  const router = useRouter();

  const handlePostAuthRedirect = async (user: User) => {
    try {
      const onboardingStatus = await getUserOnboardingStatus(user);
      if (shouldRedirectToOnboarding(onboardingStatus)) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      // Default to dashboard if there's an error
      router.push("/dashboard");
    }
  };

  useEffect(() => {
    setPasswordCriteria({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Check if all password criteria are met
    if (!Object.values(passwordCriteria).every(Boolean)) {
      setError("Please meet all password requirements");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await handlePostAuthRedirect(result.user);
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? `Registration failed: ${error.message}`
          : "Registration failed."
      );
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await handlePostAuthRedirect(result.user);
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? `Google sign-in failed: ${error.message}`
          : "Google sign-in failed."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-light-bg-secondary to-light-bg-primary dark:from-dark-bg-primary dark:to-dark-bg-secondary p-4">
      <Head>
        <title>Asetta - Sign Up</title>
        <meta
          name="description"
          content="Create your Asetta account to start managing your academic tasks."
        />
      </Head>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo 
              size="lg" 
              variant="logo-with-text" 
              color="primary"
            />
          </div>
          <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary font-heading tracking-tight">
            Create Your Account
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-3">
            Join Asetta to streamline your academic journey
          </p>
        </div>

        <div className="bg-light-bg-primary dark:bg-dark-bg-secondary rounded-2xl shadow-sm border border-light-border-primary dark:border-dark-border-primary p-8">
          {error && (
            <div className="mb-6 p-4 bg-light-error-bg dark:bg-dark-error-bg border border-light-error-text/20 dark:border-dark-error-text/20 rounded-lg shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-light-error-text dark:text-dark-error-text"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-light-error-text dark:text-dark-error-text">
                    Registration Error
                  </h3>
                  <div className="mt-1 text-sm text-light-error-text dark:text-dark-error-text">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                aria-label="Email address"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Create a password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                required
                disabled={isSubmitting}
                minLength={8}
                aria-label="Password"
              />
              {(passwordFocused || password) && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-sm">
                    <span
                      className={`mr-2 ${
                        passwordCriteria.minLength
                          ? "text-light-status-submitted-text dark:text-dark-status-submitted-text"
                          : "text-light-text-tertiary dark:text-dark-text-tertiary"
                      }`}
                    >
                      {passwordCriteria.minLength ? "✓" : "○"}
                    </span>
                    <span
                      className={
                        passwordCriteria.minLength
                          ? "text-light-status-submitted-text dark:text-dark-status-submitted-text"
                          : "text-light-text-tertiary dark:text-dark-text-tertiary"
                      }
                    >
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span
                      className={`mr-2 ${
                        passwordCriteria.hasUppercase
                          ? "text-light-status-submitted-text dark:text-dark-status-submitted-text"
                          : "text-light-text-tertiary dark:text-dark-text-tertiary"
                      }`}
                    >
                      {passwordCriteria.hasUppercase ? "✓" : "○"}
                    </span>
                    <span
                      className={
                        passwordCriteria.hasUppercase
                          ? "text-light-status-submitted-text dark:text-dark-status-submitted-text"
                          : "text-light-text-tertiary dark:text-dark-text-tertiary"
                      }
                    >
                      One uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span
                      className={`mr-2 ${
                        passwordCriteria.hasLowercase
                          ? "text-light-status-submitted-text dark:text-dark-status-submitted-text"
                          : "text-light-text-tertiary dark:text-dark-text-tertiary"
                      }`}
                    >
                      {passwordCriteria.hasLowercase ? "✓" : "○"}
                    </span>
                    <span
                      className={
                        passwordCriteria.hasLowercase
                          ? "text-light-status-submitted-text dark:text-dark-status-submitted-text"
                          : "text-light-text-tertiary dark:text-dark-text-tertiary"
                      }
                    >
                      One lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span
                      className={`mr-2 ${
                        passwordCriteria.hasNumber
                          ? "text-light-status-submitted-text dark:text-dark-status-submitted-text"
                          : "text-light-text-tertiary dark:text-dark-text-tertiary"
                      }`}
                    >
                      {passwordCriteria.hasNumber ? "✓" : "○"}
                    </span>
                    <span
                      className={
                        passwordCriteria.hasNumber
                          ? "text-light-status-submitted-text dark:text-dark-status-submitted-text"
                          : "text-light-text-tertiary dark:text-dark-text-tertiary"
                      }
                    >
                      One number
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span
                      className={`mr-2 ${
                        passwordCriteria.hasSpecialChar
                          ? "text-light-status-submitted-text dark:text-dark-status-submitted-text"
                          : "text-light-text-tertiary dark:text-dark-text-tertiary"
                      }`}
                    >
                      {passwordCriteria.hasSpecialChar ? "✓" : "○"}
                    </span>
                    <span
                      className={
                        passwordCriteria.hasSpecialChar
                          ? "text-light-status-submitted-text dark:text-dark-status-submitted-text"
                          : "text-light-text-tertiary dark:text-dark-text-tertiary"
                      }
                    >
                      One special character (!@#$%^&*(),.?&quot;:{}|&lt;&gt;)
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isSubmitting}
                minLength={8}
                aria-label="Confirm password"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn-primary w-full ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
              aria-label={isSubmitting ? "Signing up..." : "Sign up"}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing up...
                </>
              ) : (
                "Sign up with Email"
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-light-border-primary dark:border-dark-border-primary"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-light-bg-primary dark:bg-dark-bg-secondary text-light-text-tertiary dark:text-dark-text-tertiary">
                Or continue with Google
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="btn-outline w-full flex items-center justify-center gap-3 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 48 48"
            >
              <path
                fill="#FFC107"
                d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
              />
              <path
                fill="#FF3D00"
                d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
              />
            </svg>
            {isSubmitting ? "Signing up..." : "Continue with Google"}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-light-button-primary hover:text-light-button-primary-hover dark:text-dark-button-primary dark:hover:text-dark-button-primary-hover font-medium transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
