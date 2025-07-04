// src/components/RegisterForm.tsx
import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { RegisterFormProps, PasswordCriteria } from "../../types/auth";

const RegisterForm = ({
  onSuccess,
  onCancel,
  isSubmitting,
  setIsSubmitting,
  setError,
}: RegisterFormProps) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    institution: "",
    studyProgram: "",
    graduationYear: new Date().getFullYear() + 4,
  });

  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState<PasswordCriteria>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong"
  >("weak");

  // Years for graduation dropdown
  const currentYear = new Date().getFullYear();

  // Check password strength whenever password changes
  useEffect(() => {
    const password = formData.password;

    // Update criteria
    const criteria = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    setPasswordCriteria(criteria);

    // Calculate strength based on criteria
    const criteriaCount = Object.values(criteria).filter(Boolean).length;

    if (criteriaCount <= 2) {
      setPasswordStrength("weak");
    } else if (criteriaCount <= 4) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("strong");
    }
  }, [formData.password]);

  const handlePasswordFocus = () => {
    setPasswordFocused(true);
  };

  const handlePasswordBlur = () => {
    if (formData.password === "") {
      setPasswordFocused(false);
    }
  };

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

    // Check if password meets minimum requirements
    if (!passwordCriteria.minLength) {
      setError("Password must be at least 8 characters long");
      return;
    }

    // Require at least 3 criteria for medium strength password
    const criteriaCount =
      Object.values(passwordCriteria).filter(Boolean).length;
    if (criteriaCount < 3) {
      setError("Password is too weak. Please meet at least 3 requirements");
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

      // Send welcome email (non-blocking)
      try {
        const response = await fetch('/api/welcome-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            displayName: formData.displayName,
            email: formData.email,
            institution: formData.institution,
            studyProgram: formData.studyProgram,
          }),
        });

        if (response.ok) {
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Welcome email sent successfully');
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Welcome email failed to send, but registration was successful');
          }
        }
      } catch {
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Welcome email error (registration still successful)');
        }
      }

      onSuccess();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          className="input"
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
          <div className="relative">
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a secure password"
              className={`input ${
                formData.password &&
                (passwordStrength === "weak"
                  ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                  : passwordStrength === "medium"
                  ? "border-yellow-300 focus:border-yellow-400 focus:ring-yellow-200"
                  : "border-green-300 focus:border-green-400 focus:ring-green-200")
              }`}
              value={formData.password}
              onChange={handleChange}
              onFocus={handlePasswordFocus}
              onBlur={handlePasswordBlur}
              required
              disabled={isSubmitting}
              minLength={8}
            />
            {formData.password && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div
                  className={`flex items-center space-x-1 ${
                    passwordStrength === "weak"
                      ? "text-red-500"
                      : passwordStrength === "medium"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  <div className="h-1.5 w-2 rounded-full bg-current"></div>
                  <div
                    className={`h-1.5 w-2 rounded-full ${
                      passwordStrength === "weak" ? "bg-gray-200" : "bg-current"
                    }`}
                  ></div>
                  <div
                    className={`h-1.5 w-2 rounded-full ${
                      passwordStrength === "strong"
                        ? "bg-current"
                        : "bg-gray-200"
                    }`}
                  ></div>
                </div>
              </div>
            )}
          </div>
          {passwordFocused && (
            <div className="mt-2 p-3 bg-gray-50 border border-gray-100 rounded-md">
              <p className="text-xs font-medium text-gray-700 mb-1.5">
                Password must include:
              </p>
              <ul className="space-y-1 text-xs">
                <li
                  className={`flex items-center ${
                    passwordCriteria.minLength
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3.5 w-3.5 mr-1.5 ${
                      passwordCriteria.minLength
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    {passwordCriteria.minLength ? (
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    ) : (
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                        clipRule="evenodd"
                      />
                    )}
                  </svg>
                  At least 8 characters
                </li>
                <li
                  className={`flex items-center ${
                    passwordCriteria.hasUppercase
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3.5 w-3.5 mr-1.5 ${
                      passwordCriteria.hasUppercase
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    {passwordCriteria.hasUppercase ? (
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    ) : (
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                        clipRule="evenodd"
                      />
                    )}
                  </svg>
                  At least one uppercase letter (A-Z)
                </li>
                <li
                  className={`flex items-center ${
                    passwordCriteria.hasLowercase
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3.5 w-3.5 mr-1.5 ${
                      passwordCriteria.hasLowercase
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    {passwordCriteria.hasLowercase ? (
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    ) : (
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                        clipRule="evenodd"
                      />
                    )}
                  </svg>
                  At least one lowercase letter (a-z)
                </li>
                <li
                  className={`flex items-center ${
                    passwordCriteria.hasNumber
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3.5 w-3.5 mr-1.5 ${
                      passwordCriteria.hasNumber
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    {passwordCriteria.hasNumber ? (
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    ) : (
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                        clipRule="evenodd"
                      />
                    )}
                  </svg>
                  At least one number (0-9)
                </li>
                <li
                  className={`flex items-center ${
                    passwordCriteria.hasSpecialChar
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3.5 w-3.5 mr-1.5 ${
                      passwordCriteria.hasSpecialChar
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    {passwordCriteria.hasSpecialChar ? (
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    ) : (
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                        clipRule="evenodd"
                      />
                    )}
                  </svg>
                  At least one special character (!@#$%)
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className={`input ${
                formData.confirmPassword &&
                formData.password !== formData.confirmPassword
                  ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                  : formData.confirmPassword
                  ? "border-green-300 focus:border-green-400 focus:ring-green-200"
                  : ""
              }`}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
            {formData.confirmPassword && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {formData.password === formData.confirmPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            )}
          </div>
          {formData.confirmPassword &&
            formData.password !== formData.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                Passwords do not match
              </p>
            )}
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
          className="input"
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
            className="input"
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
            className="input"
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
        <input
          id="graduationYear"
          name="graduationYear"
          type="number"
          min={currentYear}
          max={currentYear + 10}
          className="input"
          value={formData.graduationYear}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="e.g., 2027"
        />
      </div>

      <div className="flex items-center justify-between space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="text-primary-600 hover:text-primary-800 text-sm font-medium"
        >
          Already have an account? Sign in
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`btn-primary ${
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
      </div>
    </form>
  );
};

export default RegisterForm;
