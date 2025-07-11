import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import DashboardLayout from "../layout/DashboardLayout";
import GradeCalculator from "../assessment/GradeCalculator";
import { LoadingSpinner, EmptyState } from "../ui";

interface GradesPageProps {
  forceSemesterId?: string;
}

const GradesPage = ({ forceSemesterId }: GradesPageProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  // Extract semester ID from URL if this is a semester-specific route
  const urlSemesterId = forceSemesterId || (router.query.semester as string);

  // State to track semester ID for useEffect
  const [currentSemesterId, setCurrentSemesterId] = useState<string>("");

  // Function to fetch available courses for the selected semester
  const fetchAvailableCourses = useCallback(
    async (semesterId: string) => {
      if (!user || !semesterId) {
        setAvailableCourses([]);
        return;
      }

      setIsLoadingCourses(true);
      try {
        const assessmentsRef = collection(
          db,
          "users",
          user.uid,
          "semesters",
          semesterId,
          "assessments"
        );
        const assessmentsQuery = query(assessmentsRef);
        const querySnapshot = await getDocs(assessmentsQuery);

        // Extract unique course names
        const courses = new Set<string>();
        querySnapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (data.courseName) {
            courses.add(data.courseName);
          }
        });

        const courseArray = Array.from(courses).sort();
        setAvailableCourses(courseArray);

        // Auto-select first course if none selected
        if (!selectedCourse && courseArray.length > 0) {
          setSelectedCourse(courseArray[0]);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setAvailableCourses([]);
      } finally {
        setIsLoadingCourses(false);
      }
    },
    [user, selectedCourse]
  );

  // Fetch courses when semester changes
  useEffect(() => {
    if (currentSemesterId) {
      fetchAvailableCourses(currentSemesterId);
    } else {
      setAvailableCourses([]);
      setSelectedCourse(null);
    }
  }, [currentSemesterId, fetchAvailableCourses]);

  // Handle course selection from URL parameters
  useEffect(() => {
    if (router.query.course && typeof router.query.course === "string") {
      const courseFromUrl = decodeURIComponent(router.query.course);
      if (
        availableCourses.includes(courseFromUrl) &&
        selectedCourse !== courseFromUrl
      ) {
        setSelectedCourse(courseFromUrl);
      }
    }
  }, [router.query.course, availableCourses, selectedCourse]);

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
      {({ selectedSemester, selectedSemesterId }) => {
        // Update current semester ID when it changes
        if (selectedSemesterId !== currentSemesterId) {
          setCurrentSemesterId(selectedSemesterId);
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
          <div className="animate-fade-in">
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
                  {isLoadingCourses ? (
                    <LoadingSpinner size="sm" />
                  ) : (
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
                  )}
                </div>
              </div>

              {/* No Courses Message */}
              {!isLoadingCourses && availableCourses.length === 0 && (
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
