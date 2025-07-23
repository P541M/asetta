import { Assessment } from "./assessment";
import { CourseStats } from "./course";

export interface DashboardData {
  selectedSemester: string;
  selectedSemesterId: string;
  assessments: Assessment[];
  courses: CourseStats[];
  availableCourses: string[];
  isLoading: boolean;
  isDataReady: boolean;
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
}

export interface TabComponentProps {
  data: DashboardData;
  urlSemesterId?: string;
}

export interface CoursesTabProps {
  data: DashboardData;
  onSelectCourse: (courseName: string) => void;
}