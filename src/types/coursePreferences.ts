export interface CoursePreferences {
  targetGrade: number;
  // Future course-specific preferences can be added here
  // gradeScale?: 'percentage' | 'letter' | 'gpa';
  // notifications?: boolean;
  // customWeighting?: boolean;
}

export interface CoursePreferencesHook {
  preferences: CoursePreferences | null;
  loading: boolean;
  error: string | null;
  updateTargetGrade: (targetGrade: number) => Promise<void>;
  resetPreferences: () => Promise<void>;
}

// Default preferences for new courses
export const DEFAULT_COURSE_PREFERENCES: CoursePreferences = {
  targetGrade: 85,
};