interface PreferencesSectionProps {
  showDaysTillDue: boolean;
  setShowDaysTillDue: (show: boolean) => void;
  showWeight: boolean;
  setShowWeight: (show: boolean) => void;
  showNotes: boolean;
  setShowNotes: (show: boolean) => void;
  showStatsBar: boolean;
  setShowStatsBar: (show: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

const PreferencesSection = ({
  showDaysTillDue,
  setShowDaysTillDue,
  showWeight,
  setShowWeight,
  showNotes,
  setShowNotes,
  showStatsBar,
  setShowStatsBar,
  isDarkMode,
  setIsDarkMode,
}: PreferencesSectionProps) => {
  return (
    <div className="space-y-6">
      {/* Dark Mode Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-dark-bg-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-dark-text-primary">
            Dark Mode
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-tertiary">
            Toggle between light and dark mode appearance
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            isDarkMode
              ? "bg-primary-600"
              : "bg-gray-200 dark:bg-dark-bg-tertiary"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
              isDarkMode ? "translate-x-8" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Show Days Till Due Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-dark-bg-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-dark-text-primary">
            Show Days Till Due
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-tertiary">
            Display days remaining until due date in the assessments table
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowDaysTillDue(!showDaysTillDue)}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            showDaysTillDue
              ? "bg-primary-600"
              : "bg-gray-200 dark:bg-dark-bg-tertiary"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
              showDaysTillDue ? "translate-x-8" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Show Weight Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-dark-bg-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-dark-text-primary">
            Show Weight Column
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-tertiary">
            Display the weight column in the assessments table
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowWeight(!showWeight)}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            showWeight
              ? "bg-primary-600"
              : "bg-gray-200 dark:bg-dark-bg-tertiary"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
              showWeight ? "translate-x-8" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Show Notes Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-dark-bg-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-dark-text-primary">
            Show Notes
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-tertiary">
            Display notes in the assessments table
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            showNotes
              ? "bg-primary-600"
              : "bg-gray-200 dark:bg-dark-bg-tertiary"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
              showNotes ? "translate-x-8" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Show Stats Bar Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-dark-bg-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-dark-text-primary">
            Show Stats Bar
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-tertiary">
            Display the statistics bar at the top of the dashboard
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowStatsBar(!showStatsBar)}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            showStatsBar
              ? "bg-primary-600"
              : "bg-gray-200 dark:bg-dark-bg-tertiary"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
              showStatsBar ? "translate-x-8" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default PreferencesSection;
