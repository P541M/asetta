import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useOnboarding } from "../../../contexts/OnboardingContext";
import { StepNavigation } from "../ui/StepNavigation";
import { db } from "../../../lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

export function SemesterStep() {
  const { user } = useAuth();
  const {
    state,
    updateSemesterData,
    setCreatedSemesterId,
    setError,
    nextStep,
  } = useOnboarding();
  const [formData, setFormData] = useState({
    name: state.semesterData.name || "",
    startDate: state.semesterData.startDate || "",
    endDate: state.semesterData.endDate || "",
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    updateSemesterData(newFormData);
  };

  const createSemester = async () => {
    if (!user || !formData.name.trim()) return;

    try {
      setIsCreating(true);
      setError(null);

      const semesterName = formData.name.trim();
      const semColRef = collection(db, "users", user.uid, "semesters");

      // Check if semester already exists
      const existingQuery = query(semColRef, orderBy("name"));
      const existingSnapshot = await getDocs(existingQuery);
      const exists = existingSnapshot.docs.some(
        (doc) => doc.data().name.toLowerCase() === semesterName.toLowerCase()
      );

      if (exists) {
        setError(
          `Semester "${semesterName}" already exists. Please choose a different name.`
        );
        return;
      }

      // Get the current highest order for proper sorting
      const orderQuery = query(semColRef, orderBy("order", "desc"), limit(1));
      const orderSnapshot = await getDocs(orderQuery);
      const currentHighestOrder = orderSnapshot.docs[0]?.data()?.order ?? -1;

      // Create the semester
      const semesterData = {
        name: semesterName,
        createdAt: new Date(),
        order: currentHighestOrder + 1,
        ...(formData.startDate && { startDate: formData.startDate }),
        ...(formData.endDate && { endDate: formData.endDate }),
      };

      const docRef = await addDoc(semColRef, semesterData);
      setCreatedSemesterId(docRef.id);

      // Automatically proceed to next step
      setIsCreating(false);
      nextStep();
    } catch (error) {
      console.error("Error creating semester:", error);
      setError("Failed to create semester. Please try again.");
      setIsCreating(false);
    }
  };

  const canContinue = formData.name.trim() !== "";

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-light-button-primary/10 dark:bg-dark-button-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-light-button-primary dark:text-dark-button-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
          Create your first semester
        </h2>
        <p className="text-light-text-secondary dark:text-dark-text-secondary">
          Set up a semester to organize your courses and assessments. You can
          add more semesters later.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Semester Name */}
        <div className="form-group">
          <label htmlFor="semesterName" className="form-label">
            Semester Name *
          </label>
          <input
            id="semesterName"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="e.g., Fall 2025, Winter 2024, Spring Term"
            className="input"
            required
          />
          <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
            Choose a name that helps you identify this academic term
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg p-4 border border-light-border-primary dark:border-dark-border-primary">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-light-button-primary dark:text-dark-button-primary flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
                Tip: Keep it simple
              </h4>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                Don&apos;t worry about getting everything perfect right now. You
                can always edit semester details or create additional semesters
                from your dashboard later.
              </p>
            </div>
          </div>
        </div>
      </div>

      <StepNavigation
        canGoNext={canContinue}
        nextLabel={state.createdSemesterId ? "Continue" : "Create Semester"}
        onNext={state.createdSemesterId ? undefined : createSemester}
        isLoading={isCreating}
      />
    </div>
  );
}
