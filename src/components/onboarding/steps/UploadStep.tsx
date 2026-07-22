import React, { useState } from "react";
import { CircleAlert, CircleCheck, CloudUpload } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useOnboarding } from "../../../contexts/OnboardingContext";
import { useCourseColors } from "../../../hooks/useCourseColors";
import { resolveCourseColor } from "../../../constants/courseColors";
import { StepNavigation } from "../ui/StepNavigation";
import { OnboardingUploadForm } from "../OnboardingUploadForm";
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert";
import CourseColorPicker from "../../ui/CourseColorPicker";
import { ExtractionResult } from "../../../types/upload";

export function UploadStep() {
  const { user } = useAuth();
  const { state, setUploadComplete } = useOnboarding();
  const [hasAttemptedUpload, setHasAttemptedUpload] = useState(false);
  const [colorError, setColorError] = useState<string | null>(null);

  const { courseColors, setCourseColor } = useCourseColors(user, state.createdSemesterId ?? "");

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

  const handleColorSelect = async (courseName: string, color: string) => {
    setColorError(null);
    try {
      await setCourseColor(courseName, color);
    } catch (error) {
      console.error("Error saving course color:", error);
      setColorError("Failed to save course color. Please try again.");
    }
  };

  const courseBreakdown = state.extractionResults?.courseBreakdown ?? [];

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

      {/* Course colors: each detected course gets a stable default; the
          leading swatch button opens the picker */}
      {state.hasCompletedUpload && state.createdSemesterId && courseBreakdown.length > 0 && (
        <div className="mb-8">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Courses detected</p>
          <div className="rounded-xl bg-secondary/50 p-1.5">
            {courseBreakdown.map((course) => (
              <div
                key={course.courseName}
                className="flex items-center justify-between gap-2 rounded-lg px-1.5 py-1"
              >
                <span className="flex min-w-0 items-center gap-1">
                  <CourseColorPicker
                    value={resolveCourseColor(courseColors[course.courseName], course.courseName)}
                    onSelect={(newColor) => handleColorSelect(course.courseName, newColor)}
                    ariaLabel={`Change color for ${course.courseName}`}
                    variant="swatch"
                  />
                  <span className="truncate text-sm font-medium text-foreground">
                    {course.courseName}
                  </span>
                </span>
                <span className="shrink-0 pr-1 text-xs text-muted-foreground">
                  {course.assessmentCount} assessment{course.assessmentCount !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
          {colorError && (
            <Alert variant="destructive" className="mt-3">
              <CircleAlert aria-hidden />
              <AlertDescription>{colorError}</AlertDescription>
            </Alert>
          )}
        </div>
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
