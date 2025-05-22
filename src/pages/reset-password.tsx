// src/pages/reset-password.tsx
import { useState } from "react";
import Head from "next/head";
import { auth } from "../lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import Header from "../components/layout/Header";
import Link from "next/link";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage({ text: "Please enter your email address", type: "error" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage({
        text: "Password reset link sent! Check your email inbox.",
        type: "success",
      });
      setEmail("");
    } catch (error) {
      let errorMessage = "Failed to send reset email. ";

      if (error instanceof Error) {
        if (error.message.includes("auth/user-not-found")) {
          errorMessage += "No account found with this email address.";
        } else if (error.message.includes("auth/invalid-email")) {
          errorMessage += "Please enter a valid email address.";
        } else {
          errorMessage += error.message;
        }
      }

      setMessage({ text: errorMessage, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Head>
        <title>Asetta - Reset Password</title>
        <meta
          name="description"
          content="Reset your Asetta account password to regain access to your academic dashboard."
        />
      </Head>
      <Header />
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
            <p className="text-gray-600 mt-2">
              Enter your email and we&apos;ll send you a link to reset your
              password
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-10">
            {message && (
              <div
                className={`mb-6 p-3 ${
                  message.type === "error"
                    ? "bg-red-50 border border-red-100 text-red-700"
                    : "bg-green-50 border border-green-100 text-green-700"
                } rounded-lg text-sm`}
              >
                <div className="flex">
                  {message.type === "error" ? (
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
                  ) : (
                    <svg
                      className="h-5 w-5 mr-2 text-green-500 flex-shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span>{message.text}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-6">
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
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-primary-500 hover:text-primary-600 text-sm font-medium"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
