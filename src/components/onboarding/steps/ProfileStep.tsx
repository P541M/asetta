import React, { useState } from "react";
import { UserRound } from "lucide-react";
import { useOnboarding } from "../../../contexts/OnboardingContext";
import { StepNavigation } from "../ui/StepNavigation";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import Avatar from "../../ui/Avatar";
import AvatarPicker from "../../ui/AvatarPicker";
import { DEFAULT_ICON } from "../../../data/profileIcons";

export function ProfileStep() {
  const { state, updateUserData } = useOnboarding();
  const [formData, setFormData] = useState({
    institution: state.userData.institution || "",
    studyProgram: state.userData.studyProgram || "",
    graduationYear: state.userData.graduationYear || new Date().getFullYear() + 4,
    avatarIconId: state.userData.avatarIconId || DEFAULT_ICON.id,
  });

  const handleInputChange = (field: string, value: string | number) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    updateUserData(newFormData);
  };

  const handleIconSelect = (iconId: string) => {
    const newFormData = {
      ...formData,
      avatarIconId: iconId,
    };
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

      {/* Avatar section */}
      <div className="mb-8 flex flex-col items-center space-y-4">
        <Avatar size="lg" iconId={formData.avatarIconId} />
        <p className="text-sm text-muted-foreground">Choose your profile avatar</p>
        <div className="w-full max-w-md">
          <AvatarPicker
            selectedIconId={formData.avatarIconId}
            onIconSelect={handleIconSelect}
            variant="inline"
            className="w-full"
          />
        </div>
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

        {/* Program */}
        <div className="space-y-1.5">
          <Label htmlFor="studyProgram">Program of study</Label>
          <Input
            id="studyProgram"
            type="text"
            value={formData.studyProgram}
            onChange={(e) => handleInputChange("studyProgram", e.target.value)}
            placeholder="e.g., Computer Science, Engineering, Business"
          />
        </div>

        {/* Expected graduation */}
        <div className="space-y-1.5">
          <Label htmlFor="graduationYear">Expected graduation</Label>
          <Input
            id="graduationYear"
            type="number"
            min={new Date().getFullYear()}
            max={new Date().getFullYear() + 10}
            value={formData.graduationYear}
            onChange={(e) =>
              handleInputChange(
                "graduationYear",
                parseInt(e.target.value) || new Date().getFullYear() + 4,
              )
            }
            placeholder="e.g., 2026, 2025"
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
