// src/pages/login.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Handle form submission based on mode (login or register)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isLogin) {
        // Sign in existing user
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Register new user
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(
          `${isLogin ? "Login" : "Registration"} failed. ${error.message}`
        );
      } else {
        setError(`${isLogin ? "Login" : "Registration"} failed.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Register / Sign in using Google
  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);

    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError("Google sign in failed. " + error.message);
      } else {
        setError("Google sign in failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary-50 p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary-700">CATT</h1>
        <p className="text-secondary-600 mt-2">
          Course Assessment Task Tracker
        </p>
      </div>

      <div className="w-full max-w-md">
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-6 text-center">
            {isLogin ? "Sign In" : "Create Account"}
          </h2>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
              <div className="flex">
                <svg
                  className="h-5 w-5 mr-2 text-red-500"
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

          <form onSubmit={handleSubmit}>
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
                {isLogin && (
                  <a
                    href="#"
                    className="text-sm text-primary-600 hover:text-primary-800"
                  >
                    Forgot password?
                  </a>
                )}
              </div>
              <input
                id="password"
                type="password"
                placeholder={
                  isLogin ? "Your password" : "Choose a secure password"
                }
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
              className={`btn-primary w-full mt-2 ${
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
                  {isLogin ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                <span>{isLogin ? "Sign In" : "Create Account"}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              {isLogin
                ? "Need an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-sm text-secondary-500">
                Or continue with
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="btn-outline w-full flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 48 48"
              className="mr-2"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-secondary-500">
        <p>
          By signing in, you agree to our{" "}
          <a href="#" className="text-primary-600 hover:text-primary-800">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary-600 hover:text-primary-800">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default Auth;
