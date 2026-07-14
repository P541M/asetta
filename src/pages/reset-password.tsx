// src/pages/reset-password.tsx
import { useState } from "react";
import { auth } from "../lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";
import AuthShell from "../components/auth/AuthShell";
import AuthMessageBanner from "../components/auth/AuthMessageBanner";
import ButtonSpinner from "../components/auth/ButtonSpinner";

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
    <AuthShell
      title="Asetta - Reset Password"
      description="Reset your Asetta account password to regain access to your academic dashboard."
      heading="Reset Password"
      subheading="Enter your email and we'll send you a link to reset your password"
      showLogo
    >
      {message && (
        <AuthMessageBanner
          type={message.type}
          title={message.type === "error" ? "Reset Error" : "Success"}
          text={message.text}
        />
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
          className={`btn-primary w-full ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
          aria-label={isSubmitting ? "Sending..." : "Send reset link"}
        >
          {isSubmitting ? (
            <>
              <ButtonSpinner />
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
    </AuthShell>
  );
};

export default ResetPassword;
