import { Assessment } from "./assessment";

export interface Day {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  assessments: Assessment[];
}

export interface CalendarViewProps {
  selectedSemester: string;
  /** The semester's assessments, live from the dashboard's listener (A11). */
  assessments: Assessment[];
}
