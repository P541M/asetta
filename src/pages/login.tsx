// src/pages/login.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { redirectAfterAuth } from "../utils/authRedirect";
import LoadingScreen from "../components/ui/LoadingScreen";
import { getAuthErrorMessage } from "../utils/authErrors";
import AuthShell from "../components/auth/AuthShell";
import AuthMessageBanner from "../components/auth/AuthMessageBanner";
import GoogleSignInButton from "../components/auth/GoogleSignInButton";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { PasswordInput } from "../components/ui/password-input";
import { Label } from "../components/ui/label";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();

  // A signed-in visitor skips the form; during an active submit the handler owns the redirect
  useEffect(() => {
    if (!loading && user && !isSubmitting) {
      redirectAfterAuth(user, router);
    }
  }, [user, loading, isSubmitting, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await redirectAfterAuth(result.user, router);
    } catch (error: unknown) {
      const message = getAuthErrorMessage(
        error,
        "Something went wrong signing you in. Please try again.",
      );
      if (message) setError(message);
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
      const message = getAuthErrorMessage(
        error,
        "Something went wrong with Google sign-in. Please try again.",
      );
      if (message) setError(message);
      setIsSubmitting(false);
    }
  };

  if (loading || (user && !isSubmitting)) {
    return <LoadingScreen />;
  }

  return (
    <AuthShell
      title="Asetta - Sign In"
      description="Sign in to Asetta to manage your academic tasks."
      heading="Welcome back"
      subheading="Sign in to your academic dashboard"
    >
      {error && <AuthMessageBanner type="error" title="Couldn't sign you in" text={error} />}

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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/reset-password"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
            minLength={6}
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <GoogleSignInButton
        onClick={handleGoogleSignIn}
        disabled={isSubmitting}
        label={isSubmitting ? "Signing in..." : "Continue with Google"}
      />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
};

export default Login;
