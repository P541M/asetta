import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../layout/DashboardLayout";
import GradeCalculator from "../assessment/GradeCalculator";
import { EmptyState } from "../ui";

interface GradesPageProps {
  forceSemesterId?: string;
}

const GradesPage = ({ forceSemesterId }: GradesPageProps) => {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  // Extract semester ID from URL if this is a semester-specific route
  const urlSemesterId = forceSemesterId || (router.query.semester as string);

  // Handle course selection from URL parameters and auto-select first course
  useEffect(() => {
    if (router.query.course && typeof router.query.course === "string") {
      const courseFromUrl = decodeURIComponent(router.query.course);
      setSelectedCourse(courseFromUrl);
    }
  }, [router.query.course]);

  const handleAddAssessment = () => {
    const basePath = urlSemesterId
      ? `/dashboard/${urlSemesterId}/add`
      : "/dashboard/add";
    window.location.href = basePath;
  };

  return (
    <DashboardLayout
      title="Grades | Asetta"
      description="Calculate and analyze your grades across courses and assessments."
      forceSemesterId={urlSemesterId}
    >
      {({ selectedSemester, selectedSemesterId, availableCourses }) => {
        // Auto-select first course if none selected and courses are available
        if (!selectedCourse && availableCourses.length > 0) {
          setSelectedCourse(availableCourses[0]);
        }

        if (!selectedSemesterId) {
          return (
            <EmptyState
              icon={
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              }
              title="No semester selected"
              description="Select a semester above to view grade calculations for your courses."
            />
          );
        }

        return (
          <div>
            <div className="p-6">
              {/* Header with Course Selection */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-medium text-gray-900 dark:text-dark-text-primary">
                    Grade Calculator
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mt-1">
                    {selectedSemester
                      ? `${selectedSemester} semester`
                      : "Select a course to calculate grades"}
                  </p>
                </div>

                {/* Course Selector */}
                <div className="flex items-center space-x-3">
                  <label
                    htmlFor="course-select"
                    className="text-sm font-medium text-gray-700 dark:text-dark-text-primary whitespace-nowrap"
                  >
                    Course:
                  </label>
                  <select
                    id="course-select"
                    value={selectedCourse || ""}
                    onChange={(e) =>
                      setSelectedCourse(e.target.value || null)
                    }
                    className="input bg-white dark:bg-dark-bg-tertiary py-1.5 px-3 text-sm dark:text-dark-text-primary dark:border-dark-border-primary min-w-48"
                    disabled={availableCourses.length === 0}
                  >
                    <option value="">Select a course...</option>
                    {availableCourses.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* No Courses Message */}
              {availableCourses.length === 0 && (
                <EmptyState
                  icon={
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  }
                  title="No courses found"
                  description="This semester doesn't have any assessments yet."
                  action={
                    <button
                      onClick={handleAddAssessment}
                      className="btn-primary"
                    >
                      Add Assessment
                    </button>
                  }
                  className="py-10 text-gray-500 dark:text-dark-text-tertiary animate-fade-in"
                />
              )}

              {/* Grade Calculator Component */}
              {availableCourses.length > 0 && (
                <GradeCalculator
                  semesterId={selectedSemesterId}
                  selectedCourse={selectedCourse}
                />
              )}
            </div>
          </div>
        );
      }}
    </DashboardLayout>
  );
};

export default GradesPage;
