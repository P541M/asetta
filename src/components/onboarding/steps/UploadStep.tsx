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

      {/* Upload Benefits */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg p-4 border border-light-border-primary dark:border-dark-border-primary">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-light-text-primary dark:text-dark-text-primary text-sm mb-1">
                What we extract
              </h4>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                Assignment names, due dates, weights, course information, and any special requirements
              </p>
            </div>
          </div>
        </div>

        <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg p-4 border border-light-border-primary dark:border-dark-border-primary">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-light-text-primary dark:text-dark-text-primary text-sm mb-1">
                Your data is safe
              </h4>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                All files are processed securely and deleted after extraction. We only store the assessment data.
              </p>
            </div>
          </div>
        </div>
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

      {/* Upload Tips */}
      {!state.hasCompletedUpload && (
        <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg p-6 border border-light-border-primary dark:border-dark-border-primary mb-8">
          <h4 className="font-medium text-light-text-primary dark:text-dark-text-primary mb-3 flex items-center">
            <svg className="w-5 h-5 text-light-button-primary dark:text-dark-button-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Tips for better results
          </h4>
          <ul className="space-y-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-light-button-primary dark:bg-dark-button-primary rounded-full flex-shrink-0 mt-2 mr-3"></span>
              Upload multiple course outlines at once for faster setup
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-light-button-primary dark:bg-dark-button-primary rounded-full flex-shrink-0 mt-2 mr-3"></span>
              PDF files work best, but we also support Word documents
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-light-button-primary dark:bg-dark-button-primary rounded-full flex-shrink-0 mt-2 mr-3"></span>
              Clear, well-formatted outlines produce the most accurate results
            </li>
          </ul>
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