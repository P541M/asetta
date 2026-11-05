import { useState } from "react";
import Link from "next/link";
import { Circle, CircleCheck, Loader2 } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { signInWithGoogle } from "../lib/googleSignIn";
import { useAuth } from "../contexts/AuthContext";
import { useRedirectAfterAuth } from "../hooks/useRedirectAfterAuth";
import LoadingScreen from "../components/ui/LoadingScreen";
import { getAuthErrorMessage } from "../utils/authErrors";
import { passwordCriteria } from "../utils/passwordCriteria";
import AuthShell from "../components/auth/AuthShell";
import AuthMessageBanner from "../components/auth/AuthMessageBanner";
import GoogleSignInButton from "../components/auth/GoogleSignInButton";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { PasswordInput } from "../components/ui/password-input";
import { Label } from "../components/ui/label";

/** One password requirement; the check animates in as the rule is met. */
const CriteriaRow = ({ met, label }: { met: boolean; label: string }) => (
  <div className="flex items-center gap-1.5 text-xs">
    {met ? (
      <CircleCheck
        className="size-3.5 shrink-0 text-success motion-safe:animate-scale-in"
        aria-hidden
      />
    ) : (
      <Circle className="size-3.5 shrink-0 text-muted-foreground/50" aria-hidden />
    )}
    <span className={met ? "text-success" : "text-muted-foreground"}>{label}</span>
  </div>
);

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { user, loading } = useAuth();
  // A signed-in visitor skips the form, and a successful submit moves on the same way
  useRedirectAfterAuth();
  const criteria = passwordCriteria(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // The visibility toggle replaces a confirm-password field; criteria still gate submission
    if (!Object.values(criteria).every(Boolean)) {
      setError("Please meet all password requirements");
      return;
    }

    setIsSubmitting(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      const message = getAuthErrorMessage(
        error,
        "Something went wrong creating your account. Please try again.",
      );
      if (message) setError(message);
      setIsSubmitting(false);
    }
  };

  // During a submit the form stays up (its button shows progress) while the user doc loads
  if (!isSubmitting && (loading || user)) {
    return <LoadingScreen />;
  }

  return (
    <AuthShell
      title="Asetta - Sign Up"
      description="Create your Asetta account to start managing your academic tasks."
      heading="Create your account"
      subheading="Join Asetta to streamline your academic journey"
    >
      {error && (
        <AuthMessageBanner type="error" title="Couldn't create your account" text={error} />
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
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
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            required
            disabled={isSubmitting}
            minLength={8}
          />
          {(passwordFocused || password) && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
              <CriteriaRow met={criteria.minLength} label="8+ characters" />
              <CriteriaRow met={criteria.hasUppercase} label="Uppercase letter" />
              <CriteriaRow met={criteria.hasLowercase} label="Lowercase letter" />
              <CriteriaRow met={criteria.hasNumber} label="Number" />
              <CriteriaRow met={criteria.hasSpecialChar} label="Special character" />
            </div>
          )}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Signing up...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <GoogleSignInButton
        onClick={() => signInWithGoogle({ setError, setIsSubmitting })}
        disabled={isSubmitting}
        label={isSubmitting ? "Signing up..." : "Continue with Google"}
      />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
};

export default Register;
