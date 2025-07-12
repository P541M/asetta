import { PreferencesSectionProps } from "../../types/preferences";

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
    <div className="space-y-8">
      {/* Appearance Section */}
      <div>
        <div className="border-b border-light-border-primary dark:border-dark-border-primary pb-4 mb-6">
          <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-light-button-primary dark:text-dark-button-primary"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
            Appearance
          </h3>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
            Customize the visual appearance of your interface
          </p>
        </div>

        <div className="flex items-center justify-between p-5 rounded-xl bg-light-bg-tertiary dark:bg-dark-bg-tertiary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary transition-all duration-200 border border-light-border-primary dark:border-dark-border-primary">
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-lg bg-light-button-primary/10 dark:bg-dark-button-primary/10">
              {isDarkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-light-button-primary dark:text-dark-button-primary"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-light-button-primary dark:text-dark-button-primary"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary">
                {isDarkMode ? "Dark Mode" : "Light Mode"}
              </h4>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {isDarkMode
                  ? "Switch to light mode for better visibility in bright environments"
                  : "Switch to dark mode for better visibility in low-light conditions"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-light-button-primary dark:focus:ring-dark-button-primary focus:ring-offset-2 shadow-sm ${
              isDarkMode
                ? "bg-light-button-primary dark:bg-dark-button-primary"
                : "bg-light-border-secondary dark:bg-dark-border-secondary"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                isDarkMode ? "translate-x-9" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Data & Display Section */}
      <div>
        <div className="border-b border-light-border-primary dark:border-dark-border-primary pb-4 mb-6">
          <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-light-button-primary dark:text-dark-button-primary"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Data & Display
          </h3>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
            Customize what information is displayed in your dashboard and tables
          </p>
        </div>

        <div className="space-y-4">
          {/* Stats Bar Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-light-bg-tertiary dark:bg-dark-bg-tertiary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary transition-all duration-200 border border-light-border-primary dark:border-dark-border-primary">
            <div className="flex-1">
              <h4 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary">
                Dashboard Statistics
              </h4>
              <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Show statistics overview at the top of your dashboard
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowStatsBar(!showStatsBar)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-light-button-primary dark:focus:ring-dark-button-primary focus:ring-offset-2 ${
                showStatsBar
                  ? "bg-light-button-primary dark:bg-dark-button-primary"
                  : "bg-light-border-secondary dark:bg-dark-border-secondary"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  showStatsBar ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Days Till Due Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-light-bg-tertiary dark:bg-dark-bg-tertiary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary transition-all duration-200 border border-light-border-primary dark:border-dark-border-primary">
            <div className="flex-1">
              <h4 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary">
                Days Until Due
              </h4>
              <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Show countdown of days remaining until assessment due dates
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDaysTillDue(!showDaysTillDue)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-light-button-primary dark:focus:ring-dark-button-primary focus:ring-offset-2 ${
                showDaysTillDue
                  ? "bg-light-button-primary dark:bg-dark-button-primary"
                  : "bg-light-border-secondary dark:bg-dark-border-secondary"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  showDaysTillDue ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Weight Column Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-light-bg-tertiary dark:bg-dark-bg-tertiary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary transition-all duration-200 border border-light-border-primary dark:border-dark-border-primary">
            <div className="flex-1">
              <h4 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary">
                Assessment Weight
              </h4>
              <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Display the weight/percentage column in assessments table
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowWeight(!showWeight)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-light-button-primary dark:focus:ring-dark-button-primary focus:ring-offset-2 ${
                showWeight
                  ? "bg-light-button-primary dark:bg-dark-button-primary"
                  : "bg-light-border-secondary dark:bg-dark-border-secondary"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  showWeight ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Notes Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-light-bg-tertiary dark:bg-dark-bg-tertiary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary transition-all duration-200 border border-light-border-primary dark:border-dark-border-primary">
            <div className="flex-1">
              <h4 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary">
                Assessment Notes
              </h4>
              <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Show notes and additional information in the assessments table
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-light-button-primary dark:focus:ring-dark-button-primary focus:ring-offset-2 ${
                showNotes
                  ? "bg-light-button-primary dark:bg-dark-button-primary"
                  : "bg-light-border-secondary dark:bg-dark-border-secondary"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  showNotes ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesSection;
