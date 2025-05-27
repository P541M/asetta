interface SettingsHeaderProps {
  onClose: () => void;
}

const SettingsHeader = ({ onClose }: SettingsHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h2 className="text-3xl font-bold text-primary-600">Settings</h2>
        <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mt-1">
          Manage your account settings and preferences
        </p>
      </div>
      <button
        onClick={onClose}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg-secondary transition-colors"
        aria-label="Close settings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-400 hover:text-gray-500 dark:text-dark-text-tertiary dark:hover:text-dark-text-secondary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
      </button>
    </div>
  );
};

export default SettingsHeader;
