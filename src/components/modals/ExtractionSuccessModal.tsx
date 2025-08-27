import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/router";
import { ExtractionResult } from "../../types/upload";

interface ExtractionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ExtractionResult;
  semesterId: string;
}

const COURSE_DISPLAY_LIMIT = 3;

const ExtractionSuccessModal: React.FC<ExtractionSuccessModalProps> = ({
  isOpen,
  onClose,
  result,
  semesterId,
}) => {
  const router = useRouter();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleViewAssessments = () => {
    onClose();
    router.push(`/dashboard/${semesterId}/assessments`);
  };

  const handleAddMoreFiles = () => {
    onClose();
    // Keep user on current page to upload more files
  };

  const handleGoToCalendar = () => {
    onClose();
    router.push(`/dashboard/${semesterId}/calendar`);
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
      style={{ zIndex: 10000 }}
      onClick={onClose}
    >
      <div
        className="bg-light-bg-primary dark:bg-dark-bg-secondary rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Success Animation */}
        <div className="p-6 text-center border-b border-gray-200 dark:border-gray-700">
          <div className="mx-auto flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
            <svg
              className="w-6 h-6 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            🎉 Extraction Complete!
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Your course outline has been successfully processed
          </p>
        </div>

        {/* Results Summary */}
        <div className="p-5 space-y-4">
          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-light-button-primary dark:text-dark-button-primary">
                {result.processedFiles}
              </div>
              <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                File{result.processedFiles !== 1 ? 's' : ''} Processed
              </div>
            </div>
            <div className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-light-button-primary dark:text-dark-button-primary">
                {result.totalAssessments}
              </div>
              <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                Assessment{result.totalAssessments !== 1 ? 's' : ''} Found
              </div>
            </div>
          </div>

          {/* Course Breakdown (if available) */}
          {result.courseBreakdown && result.courseBreakdown.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                Courses Detected:
              </h4>
              <div className="space-y-1.5">
                {result.courseBreakdown.slice(0, COURSE_DISPLAY_LIMIT).map((course, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2.5 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg"
                  >
                    <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                      {course.courseName}
                    </span>
                    <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                      {course.assessmentCount} assessment{course.assessmentCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
                {result.courseBreakdown.length > COURSE_DISPLAY_LIMIT && (
                  <div className="flex items-center justify-center p-2.5 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg border-2 border-dashed border-light-border-secondary dark:border-dark-border-secondary">
                    <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                      and {result.courseBreakdown.length - COURSE_DISPLAY_LIMIT} other{result.courseBreakdown.length - COURSE_DISPLAY_LIMIT !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Processing Time */}
          {result.processingTime && (
            <div className="flex items-center justify-center space-x-2 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Processed in {result.processingTime}s</span>
            </div>
          )}

          {/* AI Accuracy Reminder */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h5 className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-1">
                  Please Review Your Data
                </h5>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  AI extraction may not be 100% accurate. Please review your assessments and edit any incorrect details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 pt-0 space-y-2.5">
          <button
            onClick={handleViewAssessments}
            className="w-full bg-light-button-primary hover:bg-light-button-primary-hover dark:bg-dark-button-primary dark:hover:bg-dark-button-primary-hover text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Review Your Assessments</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleAddMoreFiles}
              className="bg-light-bg-primary dark:bg-dark-bg-primary border border-light-border-primary dark:border-dark-border-primary text-light-text-primary dark:text-dark-text-primary font-medium py-2 px-3 rounded-lg hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary transition-colors flex items-center justify-center space-x-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm">Add More</span>
            </button>
            <button
              onClick={handleGoToCalendar}
              className="bg-light-bg-primary dark:bg-dark-bg-primary border border-light-border-primary dark:border-dark-border-primary text-light-text-primary dark:text-dark-text-primary font-medium py-2 px-3 rounded-lg hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary transition-colors flex items-center justify-center space-x-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">Calendar</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary py-2 text-xs transition-colors"
          >
            I&apos;ll do this later
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ExtractionSuccessModal;