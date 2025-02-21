// src/pages/auth.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Register using email and password
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError("Registration failed. " + error.message);
      } else {
        setError("Registration failed.");
      }
    }
  };

  // Register / Sign in using Google
  const handleGoogleSignIn = async () => {
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
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
      <div className="p-6 bg-white rounded shadow-md w-80">
        <h1 className="text-xl mb-4 text-center">Register with Email</h1>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleEmailRegister}>
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-3 p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-3 p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Register with Email
          </button>
        </form>
      </div>
      <div className="p-6 bg-white rounded shadow-md w-80">
        <h1 className="text-xl mb-4 text-center">Or Sign in with Google</h1>
        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-red-600 text-white py-2 rounded"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Auth;
