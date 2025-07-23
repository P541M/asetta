// src/components/assessment/CourseFilteredAssessments.tsx
import { useAssessments } from "../../hooks/useAssessments";
import AssessmentsTable from "../tables/AssessmentsTable";
import { CourseFilteredAssessmentsProps } from "../../types/course";
import { useRouter } from "next/router";

const CourseFilteredAssessments = ({
  semesterId,
  selectedCourse,
  onBack,
}: CourseFilteredAssessmentsProps) => {
  const router = useRouter();

  const {
    assessments,
    loading: isLoading,
    error,
    refetch,
  } = useAssessments(semesterId, {
    courseName: selectedCourse,
  });

  const handleStatusChange = () => {
    refetch();
  };

  const handleCalculateGrades = () => {
    router.push(
      `/dashboard/${semesterId}/grades?course=${encodeURIComponent(
        selectedCourse
      )}`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pt-6 px-6">
        <button
          onClick={onBack}
          className="text-light-button-primary dark:text-dark-button-primary hover:text-light-button-primary-hover dark:hover:text-dark-button-primary-hover font-medium"
        >
          ← Back to All Courses
        </button>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-light-text-primary dark:text-dark-text-primary font-medium">
            {selectedCourse}
          </span>
          <button
            onClick={handleCalculateGrades}
            className="btn-primary px-4 py-2"
          >
            Calculate Grades
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-light-text-tertiary dark:border-dark-text-tertiary border-t-light-button-primary dark:border-t-dark-button-primary"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400 animate-fade-in">
          <p>{error}</p>
        </div>
      ) : assessments.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-dark-text-tertiary animate-fade-in">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-dark-text-tertiary animate-bounce-light"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg font-medium mb-2 dark:text-dark-text-primary">
            No assessments found for this course
          </p>
          <p>
            This course doesn&apos;t have any assessments yet. Add assessments
            manually or upload a course outline.
          </p>
        </div>
      ) : (
        <AssessmentsTable
          assessments={assessments}
          semesterId={semesterId}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default CourseFilteredAssessments;
