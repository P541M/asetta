import React from "react";
import { useTab, TabType } from "../../contexts/TabContext";

interface TabNavigationBarProps {
  className?: string;
}

const TabNavigationBar = ({ className = "" }: TabNavigationBarProps) => {
  const { activeTab, setActiveTab } = useTab();

  const tabs: { id: TabType; label: string; icon: React.ReactElement }[] = [
    {
      id: 'courses',
      label: 'Courses',
      icon: (
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
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      )
    },
    {
      id: 'assessments',
      label: 'Assessments',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      )
    },
    {
      id: 'grades',
      label: 'Grades',
      icon: (
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
          <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: (
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
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    },
    {
      id: 'add',
      label: 'Add',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
      )
    }
  ];

  const getTabButtonClass = (tabId: TabType) => 
    `flex-1 px-6 py-3 font-medium text-sm transition-all duration-200 rounded-xl ${
      activeTab === tabId
        ? "bg-light-button-primary/10 text-light-button-primary dark:bg-dark-button-primary/10 dark:text-dark-button-primary"
        : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary hover:text-light-text-primary dark:hover:text-dark-text-primary"
    }`;

  const getMobileTabButtonClass = (tabId: TabType) =>
    `px-2 py-3 font-medium text-sm transition-all duration-200 rounded-xl min-h-[44px] ${
      activeTab === tabId
        ? "bg-light-button-primary/10 text-light-button-primary dark:bg-dark-button-primary/10 dark:text-dark-button-primary"
        : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary hover:text-light-text-primary dark:hover:text-dark-text-primary active:bg-light-hover-primary/80 dark:active:bg-dark-hover-primary/80"
    }`;


  return (
    <div className={`bg-light-bg-primary dark:bg-dark-bg-secondary rounded-xl p-1 border border-light-border-primary dark:border-dark-border-primary ${className}`}>
      {/* Desktop Navigation */}
      <div className="hidden md:flex space-x-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={getTabButtonClass(tab.id)}
          >
            <div className="flex items-center justify-center space-x-2">
              {tab.icon}
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="flex justify-between gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${getMobileTabButtonClass(tab.id)} flex-1 text-center overflow-hidden`}
            >
              <div className="flex flex-col items-center justify-center space-y-0.5 w-full h-full">
                <div className="h-5 w-5 flex-shrink-0">
                  {React.cloneElement(tab.icon, {
                    className: "h-5 w-5"
                  })}
                </div>
                <span className="text-xs leading-tight truncate w-full text-center">
                  {tab.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabNavigationBar;