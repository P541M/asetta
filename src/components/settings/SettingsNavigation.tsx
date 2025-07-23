type TabType = "profile" | "preferences" | "notifications";

interface SettingsNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const SettingsNavigation = ({
  activeTab,
  setActiveTab,
}: SettingsNavigationProps) => {
  return (
    <div className="bg-light-bg-primary dark:bg-dark-bg-secondary rounded-xl p-1 border border-light-border-primary dark:border-dark-border-primary">
      {/* Desktop Navigation */}
      <div className="hidden md:flex space-x-2">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 px-6 py-3 font-medium text-sm transition-all duration-200 rounded-xl ${
            activeTab === "profile"
              ? "bg-light-button-primary/10 text-light-button-primary dark:bg-dark-button-primary/10 dark:text-dark-button-primary"
              : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary hover:text-light-text-primary dark:hover:text-dark-text-primary"
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            <span>Profile</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("preferences")}
          className={`flex-1 px-6 py-3 font-medium text-sm transition-all duration-200 rounded-xl ${
            activeTab === "preferences"
              ? "bg-light-button-primary/10 text-light-button-primary dark:bg-dark-button-primary/10 dark:text-dark-button-primary"
              : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary hover:text-light-text-primary dark:hover:text-dark-text-primary"
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            <span>Preferences</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex-1 px-6 py-3 font-medium text-sm transition-all duration-200 rounded-xl ${
            activeTab === "notifications"
              ? "bg-light-button-primary/10 text-light-button-primary dark:bg-dark-button-primary/10 dark:text-dark-button-primary"
              : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary hover:text-light-text-primary dark:hover:text-dark-text-primary"
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="m13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span>Notifications</span>
          </div>
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden grid grid-cols-3 gap-1">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-3 py-3 font-medium text-sm transition-all duration-200 rounded-xl ${
            activeTab === "profile"
              ? "bg-light-button-primary/10 text-light-button-primary dark:bg-dark-button-primary/10 dark:text-dark-button-primary"
              : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary hover:text-light-text-primary dark:hover:text-dark-text-primary"
          }`}
        >
          <div className="flex flex-col items-center space-y-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs">Profile</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("preferences")}
          className={`px-3 py-3 font-medium text-sm transition-all duration-200 rounded-xl ${
            activeTab === "preferences"
              ? "bg-light-button-primary/10 text-light-button-primary dark:bg-dark-button-primary/10 dark:text-dark-button-primary"
              : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary hover:text-light-text-primary dark:hover:text-dark-text-primary"
          }`}
        >
          <div className="flex flex-col items-center space-y-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs">Preferences</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`px-3 py-3 font-medium text-sm transition-all duration-200 rounded-xl ${
            activeTab === "notifications"
              ? "bg-light-button-primary/10 text-light-button-primary dark:bg-dark-button-primary/10 dark:text-dark-button-primary"
              : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary hover:text-light-text-primary dark:hover:text-dark-text-primary"
          }`}
        >
          <div className="flex flex-col items-center space-y-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="m13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="text-xs">Notifications</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default SettingsNavigation;
