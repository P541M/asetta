import React from "react";
import { StepNavigation } from "../ui/StepNavigation";

export function WelcomeStep() {
  return (
    <div className="text-center">
      {/* Hero Section */}
      <div className="mb-12">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-light-button-primary to-light-button-primary-hover dark:from-dark-button-primary dark:to-dark-button-primary-hover rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
            Transform Your Academic Planning
          </h1>
          <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto leading-relaxed">
            Upload your course outlines and let AI extract all assessment dates,
            weights, and deadlines automatically. Stay organized and never miss
            another deadline.
          </p>
        </div>

        {/* Feature Highlights */}
        {/* <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl p-6 border border-light-border-primary dark:border-dark-border-primary">
            <div className="w-12 h-12 bg-light-button-primary/10 dark:bg-dark-button-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-light-button-primary dark:text-dark-button-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
              AI-Powered Extraction
            </h3>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Advanced AI automatically identifies and extracts assessment information from your course outlines
            </p>
          </div>

          <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl p-6 border border-light-border-primary dark:border-dark-border-primary">
            <div className="w-12 h-12 bg-light-button-primary/10 dark:bg-dark-button-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-light-button-primary dark:text-dark-button-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
              Smart Organization
            </h3>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Automatically organize assessments by course, deadline, and importance to keep you on track
            </p>
          </div>

          <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl p-6 border border-light-border-primary dark:border-dark-border-primary">
            <div className="w-12 h-12 bg-light-button-primary/10 dark:bg-dark-button-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-light-button-primary dark:text-dark-button-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
              Never Miss Deadlines
            </h3>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Get timely reminders and visual progress tracking to stay ahead of all your academic commitments
            </p>
          </div>
        </div> */}

        {/* Getting Started Message */}
        <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl p-6 border border-light-border-primary dark:border-dark-border-primary">
          <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
            Ready to get started?
          </h3>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            We&apos;ll guide you through setting up your first semester and
            uploading your course outlines. The entire process takes less than 5
            minutes.
          </p>
        </div>
      </div>

      <StepNavigation canGoBack={false} nextLabel="Get Started" />
    </div>
  );
}
