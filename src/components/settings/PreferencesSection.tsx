import { useTheme } from "../../contexts/ThemeContext";

interface PreferencesSectionProps {
  showDaysTillDue: boolean;
  setShowDaysTillDue: (show: boolean) => void;
  showWeight: boolean;
  setShowWeight: (show: boolean) => void;
  showNotes: boolean;
  setShowNotes: (show: boolean) => void;
  showStatsBar: boolean;
  setShowStatsBar: (show: boolean) => void;
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
}: PreferencesSectionProps) => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="space-y-8">
      {/* Dark Mode Toggle */}
      <div className="flex items-center justify-between py-4">
        <div className="flex-1">
          <h3 className="text-base font-medium text-gray-900 dark:text-dark-text-primary">
            Dark Mode
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-tertiary">
            Toggle between light and dark mode appearance
          </p>
        </div>
        <button
          type="button"
          onClick={toggleDarkMode}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            isDarkMode
              ? "bg-indigo-600"
              : "bg-gray-200 dark:bg-dark-bg-tertiary"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isDarkMode ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="border-t border-gray-200 dark:border-dark-border"></div>

      {/* Show Days Till Due Toggle */}
      <div className="flex items-center justify-between py-4">
        <div className="flex-1">
          <h3 className="text-base font-medium text-gray-900 dark:text-dark-text-primary">
            Show Days Till Due
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-tertiary">
            Display days remaining until due date in the assessments table
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowDaysTillDue(!showDaysTillDue)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            showDaysTillDue
              ? "bg-indigo-600"
              : "bg-gray-200 dark:bg-dark-bg-tertiary"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              showDaysTillDue ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="border-t border-gray-200 dark:border-dark-border"></div>

      {/* Show Weight Toggle */}
      <div className="flex items-center justify-between py-4">
        <div className="flex-1">
          <h3 className="text-base font-medium text-gray-900 dark:text-dark-text-primary">
            Show Weight Column
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-tertiary">
            Display the weight column in the assessments table
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowWeight(!showWeight)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            showWeight
              ? "bg-indigo-600"
              : "bg-gray-200 dark:bg-dark-bg-tertiary"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              showWeight ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="border-t border-gray-200 dark:border-dark-border"></div>

      {/* Show Notes Toggle */}
      <div className="flex items-center justify-between py-4">
        <div className="flex-1">
          <h3 className="text-base font-medium text-gray-900 dark:text-dark-text-primary">
            Show Notes Column
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-tertiary">
            Display the notes column for each assignment
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            showNotes ? "bg-indigo-600" : "bg-gray-200 dark:bg-dark-bg-tertiary"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              showNotes ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="border-t border-gray-200 dark:border-dark-border"></div>

      {/* Show Stats Bar Toggle */}
      <div className="flex items-center justify-between py-4">
        <div className="flex-1">
          <h3 className="text-base font-medium text-gray-900 dark:text-dark-text-primary">
            Show Stats Bar
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-tertiary">
            Display the statistics bar above the assessments table
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowStatsBar(!showStatsBar)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            showStatsBar
              ? "bg-indigo-600"
              : "bg-gray-200 dark:bg-dark-bg-tertiary"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              showStatsBar ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default PreferencesSection;
