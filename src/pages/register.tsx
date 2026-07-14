import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import Link from "next/link";
import { redirectAfterAuth } from "../utils/authRedirect";
import AuthShell from "../components/auth/AuthShell";
import AuthMessageBanner from "../components/auth/AuthMessageBanner";
import GoogleSignInButton from "../components/auth/GoogleSignInButton";
import ButtonSpinner from "../components/auth/ButtonSpinner";

/** One "✓ / ○" password requirement line. */
const CriteriaRow = ({ met, label }: { met: boolean; label: React.ReactNode }) => (
  <div className="flex items-center text-sm">
    <span
      className={`mr-2 ${
        met
          ? "text-light-status-submitted-text dark:text-dark-status-submitted-text"
          : "text-light-text-tertiary dark:text-dark-text-tertiary"
      }`}
    >
      {met ? "✓" : "○"}
    </span>
    <span
      className={
        met
          ? "text-light-status-submitted-text dark:text-dark-status-submitted-text"
          : "text-light-text-tertiary dark:text-dark-text-tertiary"
      }
    >
      {label}
    </span>
  </div>
);

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
      await redirectAfterAuth(result.user, router);
    } catch (error: unknown) {
      setError(
        error instanceof Error ? `Registration failed: ${error.message}` : "Registration failed.",
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
      await redirectAfterAuth(result.user, router);
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? `Google sign-in failed: ${error.message}`
          : "Google sign-in failed.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Asetta - Sign Up"
      description="Create your Asetta account to start managing your academic tasks."
      heading="Create Your Account"
      subheading="Join Asetta to streamline your academic journey"
    >
      {error && <AuthMessageBanner type="error" title="Registration Error" text={error} />}

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
              <CriteriaRow met={passwordCriteria.minLength} label="At least 8 characters" />
              <CriteriaRow met={passwordCriteria.hasUppercase} label="One uppercase letter" />
              <CriteriaRow met={passwordCriteria.hasLowercase} label="One lowercase letter" />
              <CriteriaRow met={passwordCriteria.hasNumber} label="One number" />
              <CriteriaRow
                met={passwordCriteria.hasSpecialChar}
                label={<>One special character (!@#$%^&*(),.?&quot;:{}|&lt;&gt;)</>}
              />
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
          className={`btn-primary w-full ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
          aria-label={isSubmitting ? "Signing up..." : "Sign up"}
        >
          {isSubmitting ? (
            <>
              <ButtonSpinner />
              Signing up...
            </>
          ) : (
            "Sign up with Email"
          )}
        </button>
      </form>

      <GoogleSignInButton
        onClick={handleGoogleSignIn}
        disabled={isSubmitting}
        label={isSubmitting ? "Signing up..." : "Continue with Google"}
        className="btn-outline w-full flex items-center justify-center gap-3 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      />

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
    </AuthShell>
  );
};

export default Register;
