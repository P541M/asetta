export interface CourseFilteredAssessmentsProps {
  semesterId: string;
  selectedCourse: string;
  onBack: () => void;
}


export interface SemesterTabsProps {
  selectedSemester: string;
  onSelect: (semester: string) => void;
  className?: string;
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
  onCourseRenamed?: () => void;
}
