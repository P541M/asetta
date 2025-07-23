import React from "react";
import { useOnboarding } from "../../../contexts/OnboardingContext";

export function CompletionStep() {
  const { state, completeOnboarding } = useOnboarding();

  const handleViewDashboard = () => {
    completeOnboarding();
  };

  return (
    <div className="text-center max-w-2xl mx-auto">
      {/* Success Animation */}
      <div className="mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
          You&apos;re all set! 🎉
        </h1>

        <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
          Welcome to Asetta! Your academic planning assistant is ready to help
          you stay organized and never miss another deadline.
        </p>
      </div>

      {/* Results Summary */}
      {state.hasCompletedUpload && state.extractionResults && (
        <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl p-6 border border-light-border-primary dark:border-dark-border-primary mb-8">
          <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
            Setup Summary
          </h3>

          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-light-button-primary dark:text-dark-button-primary">
                {state.extractionResults.processedFiles}
              </div>
              <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Files Processed
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold text-light-button-primary dark:text-dark-button-primary">
                {state.extractionResults.totalAssessments}
              </div>
              <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Assessments Found
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold text-light-button-primary dark:text-dark-button-primary">
                {state.extractionResults.courseBreakdown?.length || 0}
              </div>
              <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Courses Identified
              </div>
            </div>
          </div>

          {/* Course Breakdown */}
          {state.extractionResults.courseBreakdown &&
            state.extractionResults.courseBreakdown.length > 0 && (
              <div className="mt-6 pt-6 border-t border-light-border-primary dark:border-dark-border-primary">
                <h4 className="font-medium text-light-text-primary dark:text-dark-text-primary mb-3 text-left">
                  Courses in {state.semesterData.name}:
                </h4>
                <div className="grid gap-2">
                  {state.extractionResults.courseBreakdown.map(
                    (
                      course: { courseName: string; assessmentCount: number },
                      index: number
                    ) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 px-3 bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg"
                      >
                        <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                          {course.courseName}
                        </span>
                        <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          {course.assessmentCount} assessment
                          {course.assessmentCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      )}

      {/* What's Next */}
      <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl p-6 border border-light-border-primary dark:border-dark-border-primary mb-8">
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
          What&apos;s next?
        </h3>

        <div className="grid md:grid-cols-2 gap-4 text-left">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-light-button-primary/10 dark:bg-dark-button-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-4 h-4 text-light-button-primary dark:text-dark-button-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-light-text-primary dark:text-dark-text-primary mb-1 text-sm">
                Review & organize
              </h4>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                Check extracted assessments and make any necessary adjustments
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-light-button-primary/10 dark:bg-dark-button-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-4 h-4 text-light-button-primary dark:text-dark-button-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-light-text-primary dark:text-dark-text-primary mb-1 text-sm">
                Track progress
              </h4>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                Mark assessments as complete and track your academic progress
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-light-button-primary/10 dark:bg-dark-button-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-4 h-4 text-light-button-primary dark:text-dark-button-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-light-text-primary dark:text-dark-text-primary mb-1 text-sm">
                Add more content
              </h4>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                Upload additional course outlines or create more semesters
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-light-button-primary/10 dark:bg-dark-button-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-4 h-4 text-light-button-primary dark:text-dark-button-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5v-5zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-light-text-primary dark:text-dark-text-primary mb-1 text-sm">
                Stay on top
              </h4>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                Get reminders and use the calendar view to never miss deadlines
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleViewDashboard}
          disabled={state.isLoading}
          className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state.isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span>Setting up your dashboard...</span>
            </>
          ) : (
            <>
              <span>Go to Dashboard</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5-5 5M6 12h12"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
