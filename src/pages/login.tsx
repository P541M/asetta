// src/pages/login.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import Link from "next/link";
import { redirectAfterAuth } from "../utils/authRedirect";
import AuthShell from "../components/auth/AuthShell";
import AuthMessageBanner from "../components/auth/AuthMessageBanner";
import GoogleSignInButton from "../components/auth/GoogleSignInButton";
import ButtonSpinner from "../components/auth/ButtonSpinner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await redirectAfterAuth(result.user, router);
    } catch (error: unknown) {
      setError(error instanceof Error ? `Login failed: ${error.message}` : "Login failed.");
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
      title="Asetta - Sign In"
      description="Sign in to Asetta to manage your academic tasks."
      heading="Welcome Back"
      subheading="Sign in to access your academic dashboard"
    >
      {error && <AuthMessageBanner type="error" title="Login Error" text={error} />}

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
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <Link
              href="/reset-password"
              className="text-sm text-light-button-primary hover:text-light-button-primary-hover dark:text-dark-button-primary dark:hover:text-dark-button-primary-hover transition-colors duration-200"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            placeholder="Your password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
            minLength={6}
            aria-label="Password"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`btn-primary w-full ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
          aria-label={isSubmitting ? "Signing in..." : "Sign in"}
        >
          {isSubmitting ? (
            <>
              <ButtonSpinner />
              Signing in...
            </>
          ) : (
            "Sign in with Email"
          )}
        </button>
      </form>

      <GoogleSignInButton
        onClick={handleGoogleSignIn}
        disabled={isSubmitting}
        label={isSubmitting ? "Signing in..." : "Continue with Google"}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-light-border-primary dark:border-dark-border-primary rounded-lg text-light-text-primary dark:text-dark-text-primary bg-light-bg-primary dark:bg-dark-bg-secondary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-button-primary dark:focus:ring-dark-button-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      />

      <div className="mt-6 text-center">
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-light-button-primary hover:text-light-button-primary-hover dark:text-dark-button-primary dark:hover:text-dark-button-primary-hover font-medium transition-colors duration-200"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default Login;
