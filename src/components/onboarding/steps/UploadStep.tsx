import React, { useState } from 'react';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { StepNavigation } from '../ui/StepNavigation';
import { OnboardingUploadForm } from '../OnboardingUploadForm';
import { ExtractionResult } from '../../../types/upload';

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
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-light-button-primary/10 dark:bg-dark-button-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-light-button-primary dark:text-dark-button-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
          Upload your course outlines
        </h2>
        <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">
          Upload your course syllabus, outline, or assignment schedule files. Our AI will automatically 
          extract all assessment dates, weights, and requirements.
        </p>
      </div>

      {/* Upload Form */}
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

      {/* Success Message */}
      {state.hasCompletedUpload && state.extractionResults && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">
                Upload successful!
              </h4>
              <p className="text-sm text-green-700 dark:text-green-400 mb-2">
                We processed {state.extractionResults.processedFiles} file(s) and found{' '}
                {state.extractionResults.totalAssessments} assessment(s).
              </p>
              <p className="text-xs text-green-600 dark:text-green-500">
                You can always upload more files later from your dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      <StepNavigation 
        canGoNext={state.hasCompletedUpload || hasAttemptedUpload}
        nextLabel={state.hasCompletedUpload ? "Complete Setup" : "Continue without upload"}
        showSkip={!state.hasCompletedUpload && !hasAttemptedUpload}
        skipLabel="Skip for now"
        onSkip={handleSkipUpload}
      />
    </div>
  );
}