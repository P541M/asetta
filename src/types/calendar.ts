import { Assessment } from "./assessment";

export interface Day {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  assessments: Assessment[];
}

export interface CalendarViewProps {
  selectedSemester: string;
  semesterId: string;
}
