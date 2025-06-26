// src/components/assessment/CourseFilteredAssessments.tsx
import { useState } from "react";
import { useAssessments } from "../../hooks/useAssessments";
import AssessmentsTable from "../tables/AssessmentsTable";
import GradeCalculator from "./GradeCalculator";
import { CourseFilteredAssessmentsProps } from "../../types/course";

const CourseFilteredAssessments = ({
  semesterId,
  selectedCourse,
  onBack,
}: CourseFilteredAssessmentsProps) => {
  const [showGradeCalculator, setShowGradeCalculator] = useState(false);
  
  const { 
    assessments, 
    loading: isLoading, 
    error, 
    refetch 
  } = useAssessments(semesterId, { 
    courseName: selectedCourse 
  });

  const handleStatusChange = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pt-6 px-6">
        <button
          onClick={onBack}
          className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium"
        >
          ← Back to All Courses
        </button>
        <button
          onClick={() => setShowGradeCalculator(!showGradeCalculator)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          {showGradeCalculator
            ? "Hide Grade Calculator"
            : "Show Grade Calculator"}
        </button>
      </div>

      {showGradeCalculator && (
        <GradeCalculator
          semesterId={semesterId}
          selectedCourse={selectedCourse}
        />
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-500 dark:border-t-primary-400"></div>
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
