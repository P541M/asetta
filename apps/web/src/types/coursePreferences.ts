export interface CoursePreferences {
  targetGrade: number;
  /** User-chosen "#RRGGBB" hex; absent = derive the default from the course
      name (constants/courseColors.ts). */
  color?: string;
}

export interface CoursePreferencesHook {
  preferences: CoursePreferences | null;
  loading: boolean;
  error: string | null;
  updateTargetGrade: (targetGrade: number) => Promise<void>;
}

// Default preferences for new courses
export const DEFAULT_COURSE_PREFERENCES: CoursePreferences = {
  targetGrade: 85,
};
