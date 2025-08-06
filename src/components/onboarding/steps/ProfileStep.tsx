import React, { useState } from "react";
import { useOnboarding } from "../../../contexts/OnboardingContext";
import { StepNavigation } from "../ui/StepNavigation";
import Avatar from "../../ui/Avatar";
import AvatarPicker from "../../ui/AvatarPicker";
import { DEFAULT_ICON } from "../../../data/profileIcons";

export function ProfileStep() {
  const { state, updateUserData } = useOnboarding();
  const [formData, setFormData] = useState({
    institution: state.userData.institution || "",
    program: state.userData.program || "",
    expectedGraduation: state.userData.expectedGraduation || "",
    avatarIconId: state.userData.avatarIconId || DEFAULT_ICON.id,
  });

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    updateUserData(newFormData);
  };

  const handleIconSelect = (iconId: string) => {
    const newFormData = { 
      ...formData, 
      avatarIconId: iconId
    };
    setFormData(newFormData);
    updateUserData(newFormData);
  };

  const canContinue = formData.institution.trim() !== "";

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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
          Set up your profile
        </h2>
        <p className="text-light-text-secondary dark:text-dark-text-secondary">
          Add some basic info to personalize your experience.
        </p>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center space-y-4 mb-8">
        <Avatar 
          size="lg" 
          iconId={formData.avatarIconId}
          className="shadow-lg" 
        />
        <div className="text-center">
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Choose your profile avatar
          </p>
        </div>
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
        <div className="form-group">
          <label htmlFor="institution" className="form-label">
            Institution *
          </label>
          <input
            id="institution"
            type="text"
            value={formData.institution}
            onChange={(e) => handleInputChange("institution", e.target.value)}
            placeholder="e.g., University of Toronto"
            className="input"
            required
          />
        </div>

        {/* Program */}
        <div className="form-group">
          <label htmlFor="program" className="form-label">
            Program of Study
          </label>
          <input
            id="program"
            type="text"
            value={formData.program}
            onChange={(e) => handleInputChange("program", e.target.value)}
            placeholder="e.g., Computer Science, Engineering, Business"
            className="input"
          />
        </div>

        {/* Expected Graduation */}
        <div className="form-group">
          <label htmlFor="expectedGraduation" className="form-label">
            Expected Graduation
          </label>
          <input
            id="expectedGraduation"
            type="text"
            value={formData.expectedGraduation}
            onChange={(e) =>
              handleInputChange("expectedGraduation", e.target.value)
            }
            placeholder="e.g., Spring 2026, May 2025"
            className="input"
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
