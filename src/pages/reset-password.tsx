// src/pages/reset-password.tsx
import { useState } from "react";
import Head from "next/head";
import { auth } from "../lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";
import Logo from "../components/ui/Logo";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-light-bg-secondary to-light-bg-primary dark:from-dark-bg-primary dark:to-dark-bg-secondary p-4">
      <Head>
        <title>Asetta - Reset Password</title>
        <meta
          name="description"
          content="Reset your Asetta account password to regain access to your academic dashboard."
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
          <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary font-heading tracking-tight">Reset Password</h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-3">
            Enter your email and we&apos;ll send you a link to reset your
            password
          </p>
        </div>

        <div className="bg-light-bg-primary dark:bg-dark-bg-secondary rounded-2xl shadow-sm border border-light-border-primary dark:border-dark-border-primary p-8">
            {message && (
              <div className={`mb-6 p-4 ${
                message.type === "error"
                  ? "bg-light-error-bg dark:bg-dark-error-bg border border-light-error-text/20 dark:border-dark-error-text/20"
                  : "bg-light-success-bg dark:bg-dark-success-bg border border-light-success-text/20 dark:border-dark-success-text/20"
              } rounded-lg shadow-sm`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {message.type === "error" ? (
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
                    ) : (
                      <svg
                        className="h-5 w-5 text-light-success-text dark:text-dark-success-text"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${
                      message.type === "error"
                        ? "text-light-error-text dark:text-dark-error-text"
                        : "text-light-success-text dark:text-dark-success-text"
                    }`}>
                      {message.type === "error" ? "Reset Error" : "Success"}
                    </h3>
                    <div className={`mt-1 text-sm ${
                      message.type === "error"
                        ? "text-light-error-text dark:text-dark-error-text"
                        : "text-light-success-text dark:text-dark-success-text"
                    }`}>{message.text}</div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-5">
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

              <button
                type="submit"
                disabled={isSubmitting}
                className={`btn-primary w-full ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
                aria-label={isSubmitting ? "Sending..." : "Send reset link"}
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
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-light-button-primary hover:text-light-button-primary-hover dark:text-dark-button-primary dark:hover:text-dark-button-primary-hover text-sm font-medium transition-colors duration-200"
              >
                Back to Login
              </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
