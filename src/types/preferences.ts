export interface PreferencesSectionProps {
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
