import React, { useState } from "react";
import { UserRound } from "lucide-react";
import { useOnboarding } from "../../../contexts/OnboardingContext";
import { useAuth } from "../../../contexts/AuthContext";
import { StepNavigation } from "../ui/StepNavigation";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import Avatar from "../../ui/Avatar";

export function ProfileStep() {
  const { state, updateUserData } = useOnboarding();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    institution: state.userData.institution || "",
  });

  const handleInputChange = (field: string, value: string | number) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    updateUserData(newFormData);
  };

  const canContinue = formData.institution.trim() !== "";

  return (
    <div className="mx-auto max-w-lg">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-xl bg-primary/10">
          <UserRound className="size-8 text-primary" aria-hidden />
        </div>
        <h2 className="mb-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Set up your profile
        </h2>
        <p className="text-muted-foreground">Add some basic info to personalize your experience.</p>
      </div>

      {/* Avatar */}
      <div className="mb-8 flex justify-center">
        <Avatar size="lg" name={user?.displayName || user?.email || undefined} />
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Institution */}
        <div className="space-y-1.5">
          <Label htmlFor="institution">
            Institution <span className="text-destructive">*</span>
          </Label>
          <Input
            id="institution"
            type="text"
            value={formData.institution}
            onChange={(e) => handleInputChange("institution", e.target.value)}
            placeholder="e.g., University of Toronto"
            required
          />
        </div>
      </div>

      <StepNavigation
        canGoNext={canContinue}
        nextLabel="Continue"
        showSkip={true}
        skipLabel="Skip for now"
      />
    </div>
  );
}
