import React, { useState } from "react";
import { CalendarDays } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useOnboarding } from "../../../contexts/OnboardingContext";
import { StepNavigation } from "../ui/StepNavigation";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { db } from "../../../lib/firebase";
import { collection, addDoc, query, orderBy, limit, getDocs } from "firebase/firestore";

export function SemesterStep() {
  const { user } = useAuth();
  const { state, updateSemesterData, setCreatedSemesterId, setError, nextStep } = useOnboarding();
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

    // Clear error when user starts typing a new semester name
    if (field === "name" && state.error) {
      setError(null);
    }
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
        (doc) => doc.data().name.toLowerCase() === semesterName.toLowerCase(),
      );

      if (exists) {
        setError(`Semester "${semesterName}" already exists. Please choose a different name.`);
        setIsCreating(false); // Allow user to try again
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
    <div className="mx-auto max-w-lg">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-xl bg-primary/10">
          <CalendarDays className="size-8 text-primary" aria-hidden />
        </div>
        <h2 className="mb-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Create your first semester
        </h2>
        <p className="text-muted-foreground">Give your semester a name to get started.</p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Semester name */}
        <div className="space-y-1.5">
          <Label htmlFor="semesterName">
            Semester name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="semesterName"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="e.g., Fall 2025, Winter 2024, Spring Term"
            required
          />
        </div>
      </div>

      <StepNavigation
        canGoNext={canContinue}
        nextLabel={state.createdSemesterId ? "Continue" : "Create semester"}
        onNext={state.createdSemesterId ? undefined : createSemester}
        isLoading={isCreating}
      />
    </div>
  );
}
