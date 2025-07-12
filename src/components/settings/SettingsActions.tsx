interface SettingsActionsProps {
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  hasChanges: boolean;
  isSubmitting: boolean;
}

const SettingsActions = ({
  onCancel,
  onSubmit,
  hasChanges,
  isSubmitting,
}: SettingsActionsProps) => {
  return (
    <div className="mt-8 pt-6 border-t border-light-border-primary dark:border-dark-border-primary">
      <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-xl transition-all duration-200 border border-light-border-primary dark:border-dark-border-primary bg-light-bg-primary dark:bg-dark-bg-primary"
        >
          Cancel & Go Back
        </button>
        <button
          type="submit"
          disabled={!hasChanges || isSubmitting}
          onClick={onSubmit}
          className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 min-w-[140px] ${
            hasChanges && !isSubmitting
              ? "bg-light-button-primary hover:bg-light-button-primary-hover dark:bg-dark-button-primary dark:hover:bg-dark-button-primary-hover text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              : "bg-light-border-secondary dark:bg-dark-border-secondary text-light-text-tertiary dark:text-dark-text-tertiary cursor-not-allowed"
          }`}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
      
      {hasChanges && (
        <div className="mt-4 flex items-center space-x-2 text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>You have unsaved changes</span>
        </div>
      )}
    </div>
  );
};

export default SettingsActions;
