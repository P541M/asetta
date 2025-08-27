import React, { useEffect } from "react";
import { createPortal } from "react-dom";

interface ApiLimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiLimitReachedModal: React.FC<ApiLimitReachedModalProps> = ({
  isOpen,
  onClose,
}) => {
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

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
      style={{ zIndex: 10000 }}
      onClick={onClose}
    >
      <div
        className="bg-light-bg-primary dark:bg-dark-bg-secondary rounded-2xl shadow-2xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 text-center border-b border-light-border-primary dark:border-dark-border-primary">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-amber-600 dark:text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
            Daily Limit Reached
          </h2>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            We&apos;ve hit our daily processing capacity
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-center">
            <p className="text-light-text-primary dark:text-dark-text-primary mb-4 leading-relaxed">
              Our AI-powered document processing has reached its daily limit. This helps us maintain quality service for everyone!
            </p>
            
            <div className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-light-button-primary dark:text-dark-button-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-light-text-primary dark:text-dark-text-primary">
                  Daily limits refresh at midnight UTC
                </span>
              </div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Please check back tomorrow to continue using our AI extraction feature
              </p>
            </div>

            <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-4">
              <h4 className="font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                What you can do now:
              </h4>
              <ul className="text-sm text-light-text-secondary dark:text-dark-text-secondary space-y-1 text-left">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-light-button-primary dark:bg-dark-button-primary rounded-full flex-shrink-0"></span>
                  <span>Add assessments manually using the Quick Add form</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-light-button-primary dark:bg-dark-button-primary rounded-full flex-shrink-0"></span>
                  <span>Review and manage your existing assessments</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-light-button-primary dark:bg-dark-button-primary rounded-full flex-shrink-0"></span>
                  <span>Come back tomorrow for AI-powered extraction</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full bg-light-button-primary hover:bg-light-button-primary-hover dark:bg-dark-button-primary dark:hover:bg-dark-button-primary-hover text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>I Understand</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ApiLimitReachedModal;