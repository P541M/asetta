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
    <div className="mt-8 flex justify-end space-x-4">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={!hasChanges || isSubmitting}
        onClick={onSubmit}
        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 ${
          hasChanges && !isSubmitting
            ? "bg-light-button-primary hover:bg-light-button-primary-hover dark:bg-dark-button-primary dark:hover:bg-dark-button-primary-hover shadow-sm hover:shadow"
            : "bg-light-border-primary dark:bg-dark-border-primary cursor-not-allowed"
        }`}
      >
        {isSubmitting ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
};

export default SettingsActions;
