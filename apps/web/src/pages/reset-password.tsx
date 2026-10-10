// src/pages/reset-password.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";
import { getAuthErrorMessage } from "../utils/authErrors";
import AuthShell from "../components/auth/AuthShell";
import AuthMessageBanner from "../components/auth/AuthMessageBanner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setSentTo(email);
      setEmail("");
    } catch (error: unknown) {
      const message = getAuthErrorMessage(
        error,
        "We couldn't send the reset email. Please try again.",
      );
      if (message) setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sentTo) {
    return (
      <AuthShell
        title="Asetta - Reset Password"
        description="Reset your Asetta account password to regain access to your academic dashboard."
        heading="Check your inbox"
        subheading="Follow the link in the email to set a new password"
      >
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10">
            <MailCheck className="size-6 text-success" aria-hidden />
          </div>
          <p className="mt-5 text-sm text-muted-foreground">
            We sent a password reset link to{" "}
            <span className="font-medium text-foreground">{sentTo}</span>. It can take a minute to
            arrive, and it&apos;s worth checking spam.
          </p>
          <Button size="lg" className="mt-8 w-full" onClick={() => router.push("/login")}>
            Back to login
          </Button>
          <button
            type="button"
            onClick={() => setSentTo(null)}
            className="mt-4 text-sm font-medium text-primary underline-offset-4 outline-hidden hover:underline focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            Use a different email
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Asetta - Reset Password"
      description="Reset your Asetta account password to regain access to your academic dashboard."
      heading="Reset password"
      subheading="Enter your email and we'll send you a link to reset your password"
    >
      {error && <AuthMessageBanner type="error" title="Couldn't send the link" text={error} />}

      <form onSubmit={handleResetPassword} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Sending...
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Back to login
        </Link>
      </p>
    </AuthShell>
  );
};

export default ResetPassword;
