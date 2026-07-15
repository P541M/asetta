import React, { useState } from "react";
import { CircleCheck, CloudUpload } from "lucide-react";
import { useOnboarding } from "../../../contexts/OnboardingContext";
import { StepNavigation } from "../ui/StepNavigation";
import { OnboardingUploadForm } from "../OnboardingUploadForm";
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert";
import { ExtractionResult } from "../../../types/upload";

export function UploadStep() {
  const { state, setUploadComplete } = useOnboarding();
  const [hasAttemptedUpload, setHasAttemptedUpload] = useState(false);

  const handleUploadSuccess = (results: ExtractionResult) => {
    setUploadComplete(results);
    setHasAttemptedUpload(true);
  };

  const handleSkipUpload = () => {
    // Allow skipping if they haven't attempted upload yet
    if (!hasAttemptedUpload) {
      setHasAttemptedUpload(true);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-xl bg-primary/10">
          <CloudUpload className="size-8 text-primary" aria-hidden />
        </div>
        <h2 className="mb-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Upload your course outlines
        </h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Upload your course files and we&apos;ll automatically extract your assessments.
        </p>
      </div>

      {/* Upload form */}
      {state.createdSemesterId && (
        <div className="mb-8">
          <OnboardingUploadForm
            semesterId={state.createdSemesterId}
            semesterName={state.semesterData.name}
            onUploadSuccess={handleUploadSuccess}
            showGuidance={true}
          />
        </div>
      )}

      {/* Success message */}
      {state.hasCompletedUpload && state.extractionResults && (
        <Alert variant="success" className="mb-8">
          <CircleCheck aria-hidden />
          <AlertTitle>Upload successful</AlertTitle>
          <AlertDescription>
            Found {state.extractionResults.totalAssessments} assessment(s) from{" "}
            {state.extractionResults.processedFiles} file(s).
          </AlertDescription>
        </Alert>
      )}

      <StepNavigation
        canGoNext={state.hasCompletedUpload || hasAttemptedUpload}
        nextLabel={state.hasCompletedUpload ? "Complete setup" : "Continue without upload"}
        showSkip={!state.hasCompletedUpload && !hasAttemptedUpload}
        skipLabel="Skip for now"
        onSkip={handleSkipUpload}
      />
    </div>
  );
}
