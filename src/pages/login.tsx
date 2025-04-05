// src/pages/login.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import Header from "../components/Header";
import Link from "next/link";
import EnhancedRegisterForm from "../components/EnhancedRegisterForm";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMethod, setAuthMethod] = useState<"email" | "google" | "apple">(
    "google"
  );
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? `Login failed: ${error.message}`
          : "Login failed."
      );
      setIsSubmitting(false);
    }
  };

  const handleRegistrationSuccess = () => {
    router.push("/dashboard");
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? `Google sign-in failed: ${error.message}`
          : "Google sign-in failed."
      );
      setIsSubmitting(false);
    }
  };

  const handleAppleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    const provider = new OAuthProvider("apple.com");
    provider.addScope("email");
    provider.addScope("name");
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? `Apple sign-in failed: ${error.message}`
          : "Apple sign-in failed."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-heading tracking-tight">
              {isLogin ? "Welcome Back" : "Join Kivo"}
            </h1>
            <p className="text-gray-600 mt-2">
              {isLogin
                ? "Sign in to access your academic dashboard"
                : "Create an account to start tracking your academic progress"}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-10">
            <div className="flex mb-6 border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setAuthMethod("google")}
                className={`flex-1 py-3 px-4 font-medium text-sm ${
                  authMethod === "google"
                    ? "bg-indigo-50 text-indigo-600 border-b-2 border-indigo-500"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {isLogin ? "Sign in with Google" : "Sign up with Google"}
              </button>
              <button
                onClick={() => setAuthMethod("apple")}
                className={`flex-1 py-3 px-4 font-medium text-sm ${
                  authMethod === "apple"
                    ? "bg-indigo-50 text-indigo-600 border-b-2 border-indigo-500"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {isLogin ? "Sign in with Apple" : "Sign up with Apple"}
              </button>
              <button
                onClick={() => setAuthMethod("email")}
                className={`flex-1 py-3 px-4 font-medium text-sm ${
                  authMethod === "email"
                    ? "bg-indigo-50 text-indigo-600 border-b-2 border-indigo-500"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {isLogin ? "Sign in with Email" : "Sign up with Email"}
              </button>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
                <div className="flex">
                  <svg
                    className="h-5 w-5 mr-2 text-red-500 flex-shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {authMethod === "google" ? (
              <div className="text-center">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 48 48"
                    className="mr-2"
                  >
                    <path
                      fill="#fff"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#fff"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#fff"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#fff"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  {isSubmitting
                    ? isLogin
                      ? "Signing in..."
                      : "Signing up..."
                    : isLogin
                    ? "Continue with Google"
                    : "Sign up with Google"}
                </button>
              </div>
            ) : authMethod === "apple" ? (
              <div className="text-center">
                <button
                  onClick={handleAppleSignIn}
                  disabled={isSubmitting}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="white"
                    className="mr-2"
                  >
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.42-1.09-.49-2.09-.48-3.26.42-1.13.87-2.07.95-3.05-.42-4.95-5.48-1.45-13.78 5.04-13.78 5.79 0 8.08 6.49 4.06 13.06-.64.71-1.29 1.39-2.01 2.08zM12.23 4.93c.96-1.2 2.65-2.02 4.21-1.77-.17 1.58-1 3.03-2.35 4-1.26.91-2.81.51-4.09-.45-.73-.54-1.36-1.38-1.77-2.28z" />
                  </svg>
                  {isSubmitting
                    ? isLogin
                      ? "Signing in..."
                      : "Signing up..."
                    : isLogin
                    ? "Continue with Apple"
                    : "Sign up with Apple"}
                </button>
              </div>
            ) : (
              <>
                {isLogin ? (
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
                      />
                    </div>
                    <div className="form-group">
                      <div className="flex justify-between">
                        <label htmlFor="password" className="form-label">
                          Password
                        </label>
                        <Link
                          href="/reset-password"
                          className="text-sm text-indigo-600 hover:text-indigo-800"
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
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`btn-primary w-full py-2.5 ${
                        isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
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
                          Signing in...
                        </span>
                      ) : (
                        "Sign In"
                      )}
                    </button>
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setIsLogin(false)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Need an account? Sign up
                      </button>
                    </div>
                  </form>
                ) : (
                  <EnhancedRegisterForm
                    onSuccess={handleRegistrationSuccess}
                    onCancel={() => setIsLogin(true)}
                    isSubmitting={isSubmitting}
                    setIsSubmitting={setIsSubmitting}
                    setError={setError}
                  />
                )}
              </>
            )}
            {(authMethod === "google" || authMethod === "apple") && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  {isLogin
                    ? "Don't have this account?"
                    : "Prefer a different method?"}
                </p>
                <button
                  onClick={() => setAuthMethod("email")}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  {isLogin
                    ? "Use email and password instead"
                    : "Sign up with email and password"}
                </button>
              </div>
            )}
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>
                By signing in, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
