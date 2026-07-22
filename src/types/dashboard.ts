import { Assessment } from "./assessment";
import { CourseStats } from "./course";

export interface DashboardData {
  selectedSemester: string;
  selectedSemesterId: string;
  assessments: Assessment[];
  courses: CourseStats[];
  availableCourses: string[];
  error: string | null;
  stats: {
    total: number;
    notStarted: number;
    inProgress: number;
    submitted: number;
    upcomingDeadlines: number;
    completionRate: number;
  };
  refreshAssessments: () => void;
  refreshTrigger: number;
  /** Explicitly stored "#RRGGBB" colors only; resolve with resolveCourseColor(map[name], name). */
  courseColors: Record<string, string>;
  setCourseColor: (courseName: string, color: string) => Promise<void>;
}

export interface TabComponentProps {
  data: DashboardData;
  urlSemesterId?: string;
}

export interface CoursesTabProps {
  data: DashboardData;
  onSelectCourse: (courseName: string) => void;
}
