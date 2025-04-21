import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { auth, db } from "../lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Header from "../components/Header";
import Link from "next/link";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    institution: "",
    studyProgram: "",
    graduationYear: new Date().getFullYear() + 4,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMethod, setAuthMethod] = useState<"email" | "google">("email");
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "graduationYear" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!formData.displayName.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // Update the user profile with the display name
      await updateProfile(user, {
        displayName: formData.displayName,
      });

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        displayName: formData.displayName,
        email: formData.email,
        institution: formData.institution,
        studyProgram: formData.studyProgram,
        graduationYear: formData.graduationYear,
        createdAt: new Date(),
        lastLogin: new Date(),
      });

      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        let errorMessage = "Registration failed. ";

        if (error.message.includes("auth/email-already-in-use")) {
          errorMessage += "An account with this email already exists.";
        } else if (error.message.includes("auth/invalid-email")) {
          errorMessage += "Please enter a valid email address.";
        } else {
          errorMessage += error.message;
        }

        setError(errorMessage);
      } else {
        setError("Registration failed due to an unknown error.");
      }
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setIsSubmitting(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        displayName: user.displayName || "User",
        email: user.email,
        createdAt: new Date(),
        lastLogin: new Date(),
      });
      
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? `Google sign-up failed: ${error.message}`
          : "Google sign-up failed."
      );
      setIsSubmitting(false);
    }
  };

  // Years for graduation dropdown
  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from(
    { length: 11 },
    (_, i) => currentYear + i
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Head>
        <title>Kivo - Create Account</title>
        <meta
          name="description"
          content="Sign up for Kivo to start tracking your academic progress."
        />
      </Head>
      <Header />
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-heading tracking-tight">
              Create Your Account
            </h1>
            <p className="text-gray-600 mt-2">
              Join Kivo to start tracking your academic progress
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex mb-6 bg-gray-50 rounded-lg overflow-hidden p-1">
              <button
                onClick={() => setAuthMethod("email")}
                className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  authMethod === "email"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Sign up with Email
              </button>
              <button
                onClick={() => setAuthMethod("google")}
                className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  authMethod === "google"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Sign up with Google
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-red-500 mr-2 flex-shrink-0"
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
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            {authMethod === "google" ? (
              <div className="text-center">
                <button
                  onClick={handleGoogleSignUp}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  {isSubmitting ? "Creating account..." : "Sign up with Google"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="input focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="password" className="form-label">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Create a secure password"
                      className="input focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      minLength={8}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="input focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="displayName" className="form-label">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    placeholder="Your name"
                    className="input focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.displayName}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="institution" className="form-label">
                      Institution/School
                    </label>
                    <input
                      id="institution"
                      name="institution"
                      type="text"
                      placeholder="Your university or school"
                      className="input focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.institution}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="studyProgram" className="form-label">
                      Program/Major
                    </label>
                    <input
                      id="studyProgram"
                      name="studyProgram"
                      type="text"
                      placeholder="Your field of study"
                      className="input focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.studyProgram}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="graduationYear" className="form-label">
                    Expected Graduation Year
                  </label>
                  <select
                    id="graduationYear"
                    name="graduationYear"
                    className="input focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  >
                    {graduationYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
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
                      Creating Account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>
            )}

            {authMethod === "google" && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Prefer a different method?
                </p>
                <button
                  onClick={() => setAuthMethod("email")}
                  className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                >
                  Sign up with email and password
                </button>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
              <p>
                By signing up, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
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

export default Register; 