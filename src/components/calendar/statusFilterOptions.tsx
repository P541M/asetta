import { type SelectOption } from "../ui/CustomSelect";

export const statusFilterOptions: SelectOption[] = [
  {
    value: "all",
    label: "All Status",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    colorClass: "text-light-text-primary dark:text-dark-text-primary",
  },
  {
    value: "Not started",
    label: "Not Started",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <path strokeWidth="2" d="M12 6v6l4 2" />
      </svg>
    ),
    colorClass: "text-gray-600 dark:text-gray-400",
    bgClass: "bg-gray-100 dark:bg-gray-800",
  },
  {
    value: "In progress",
    label: "In Progress",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <polyline points="12,6 12,12 16,14" strokeWidth="2" />
      </svg>
    ),
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-100 dark:bg-amber-900/30",
  },
  {
    value: "Submitted",
    label: "Submitted",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
    ),
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-100 dark:bg-emerald-900/30",
  },
];
