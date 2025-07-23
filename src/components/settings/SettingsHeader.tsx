interface SettingsHeaderProps {
  onClose: () => void;
}

const SettingsHeader = ({ onClose }: SettingsHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-7">
      <div>
        <h2 className="text-3xl font-bold text-light-button-primary dark:text-dark-button-primary">
          Settings
        </h2>
      </div>
      <button
        onClick={onClose}
        className="p-2 rounded-full hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary transition-colors"
        aria-label="Close settings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-secondary dark:hover:text-dark-text-secondary"
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
