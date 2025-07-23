import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export type TabType = 'courses' | 'assessments' | 'grades' | 'calendar' | 'add';

interface TabContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

interface TabProviderProps {
  children: React.ReactNode;
  initialTab?: TabType;
}

export const TabProvider: React.FC<TabProviderProps> = ({ 
  children, 
  initialTab = 'courses' 
}) => {
  const router = useRouter();
  const [activeTab, setActiveTabState] = useState<TabType>(initialTab);

  // Sync tab state with URL query parameter
  useEffect(() => {
    const { tab } = router.query;
    if (typeof tab === 'string' && isValidTab(tab)) {
      setActiveTabState(tab as TabType);
    } else if (router.pathname.includes('/courses')) {
      setActiveTabState('courses');
    } else if (router.pathname.includes('/assessments')) {
      setActiveTabState('assessments');
    } else if (router.pathname.includes('/grades')) {
      setActiveTabState('grades');
    } else if (router.pathname.includes('/calendar')) {
      setActiveTabState('calendar');
    } else if (router.pathname.includes('/add')) {
      setActiveTabState('add');
    }
  }, [router.query, router.pathname]);

  const setActiveTab = (tab: TabType) => {
    setActiveTabState(tab);
    
    // Update URL without triggering a page reload
    const currentPath = router.asPath.split('?')[0];
    const newQuery = { ...router.query, tab };
    
    router.replace({
      pathname: currentPath,
      query: newQuery,
    }, undefined, { shallow: true });
  };

  const value = {
    activeTab,
    setActiveTab,
  };

  return (
    <TabContext.Provider value={value}>
      {children}
    </TabContext.Provider>
  );
};

export const useTab = (): TabContextType => {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error('useTab must be used within a TabProvider');
  }
  return context;
};

function isValidTab(tab: string): tab is TabType {
  return ['courses', 'assessments', 'grades', 'calendar', 'add'].includes(tab);
}