/**
 * Utility functions for handling assessment status styling and logic
 */

export type AssessmentStatus = "Submitted" | "In progress" | "Missed" | string;

/**
 * Gets the appropriate CSS classes for displaying assessment status
 * Used consistently across Calendar, AssessmentTable, and other components
 */
export const getStatusStyles = (status: AssessmentStatus): {
  text: string;
  background: string;
  badge: string;
} => {
  switch (status) {
    case "Submitted":
      return {
        text: "text-emerald-600 dark:text-emerald-400",
        background: "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800",
        badge: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400"
      };
    case "In progress":
      return {
        text: "text-amber-600 dark:text-amber-400",
        background: "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800",
        badge: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400"
      };
    case "Missed":
      return {
        text: "text-red-600 dark:text-red-400",
        background: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800",
        badge: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
      };
    default:
      return {
        text: "text-gray-600 dark:text-gray-400",
        background: "bg-gray-50 dark:bg-dark-bg-tertiary border border-gray-200 dark:border-dark-border-primary",
        badge: "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400"
      };
  }
};

/**
 * Gets the full CSS class string for status backgrounds (used in Calendar)
 * @param status Assessment status
 * @returns Complete CSS class string
 */
export const getStatusBackgroundClasses = (status: AssessmentStatus): string => {
  const styles = getStatusStyles(status);
  return `${styles.background} ${styles.text}`;
};

/**
 * Gets the CSS classes for status badges (used in tables and modals)
 * @param status Assessment status
 * @returns CSS class string for badges
 */
export const getStatusBadgeClasses = (status: AssessmentStatus): string => {
  const styles = getStatusStyles(status);
  return `px-2 py-1 rounded-full text-xs font-medium ${styles.badge}`;
};

/**
 * Gets just the text color classes for status display
 * @param status Assessment status
 * @returns CSS text color classes
 */
export const getStatusTextClasses = (status: AssessmentStatus): string => {
  const styles = getStatusStyles(status);
  return styles.text;
};