import { Dispatch, SetStateAction } from "react";
import { Assessment } from "./assessment";
import { Semester } from "./semester";

export interface CourseFilteredAssessmentsProps {
  /** The semester's assessments, live from the dashboard's listener (A11). */
  assessments: Assessment[];
  error: string | null;
  semesterId: string;
  selectedCourse: string;
  onBack: () => void;
  courseColors: Record<string, string>;
}

export interface SemesterTabsProps {
  semesters: Semester[];
  setSemesters: Dispatch<SetStateAction<Semester[]>>;
  activeSemester: Semester | null;
  isLoading: boolean;
}

export interface CourseStats {
  courseName: string;
  totalAssessments: number;
  pendingAssessments: number;
  completedAssessments: number;
  nextDueDate: string | null;
  nextAssignment: string | null;
  progress: number;
}

export interface CoursesOverviewTableProps {
  courses: CourseStats[];
  onSelectCourse: (courseName: string) => void;
  semesterId: string;
  courseColors: Record<string, string>;
  setCourseColor: (courseName: string, color: string) => Promise<void>;
}
