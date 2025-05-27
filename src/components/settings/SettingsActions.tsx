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
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={!hasChanges || isSubmitting}
        onClick={onSubmit}
        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 ${
          hasChanges && !isSubmitting
            ? "bg-primary-600 hover:bg-primary-700 shadow-sm hover:shadow"
            : "bg-gray-300 dark:bg-dark-bg-tertiary cursor-not-allowed"
        }`}
      >
        {isSubmitting ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
};

export default SettingsActions;
