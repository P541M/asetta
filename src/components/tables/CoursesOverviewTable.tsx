import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import {
  collection,
  query,
  getDocs,
} from "firebase/firestore";
import {
  formatLocalDate,
  isUpcoming as isDateUpcoming,
} from "../../utils/dateUtils";
import { CourseStats, CoursesOverviewTableProps } from "../../types/course";
import { Assessment } from "../../types/assessment";

const CoursesOverviewTable = ({
  semesterId,
  onSelectCourse,
}: CoursesOverviewTableProps) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!user || !semesterId) {
        setCourses([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const assessmentsRef = collection(
          db,
          "users",
          user.uid,
          "semesters",
          semesterId,
          "assessments"
        );
        const querySnapshot = await getDocs(query(assessmentsRef));
        const assessmentsList: Assessment[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Assessment, "id">),
        }));

        const courseMap = new Map<string, Assessment[]>();
        assessmentsList.forEach((assessment) => {
          if (!courseMap.has(assessment.courseName)) {
            courseMap.set(assessment.courseName, []);
          }
          courseMap.get(assessment.courseName)?.push(assessment);
        });


        const courseStatsList: CourseStats[] = [];
        courseMap.forEach((assessments, courseName) => {
          const completedStatuses = ["Submitted"];
          const completed = assessments.filter((a) =>
            completedStatuses.includes(a.status)
          );
          const now = new Date();
          const upcomingAssessments = assessments
            .filter(
              (a) =>
                !completedStatuses.includes(a.status) &&
                (() => {
                  const [year, month, day] = a.dueDate.split("-").map(Number);
                  const [hours, minutes] = (a.dueTime || "23:59")
                    .split(":")
                    .map(Number);
                  const due = new Date(year, month - 1, day, hours, minutes);
                  return due >= now;
                })()
            )
            .sort((a, b) => {
              const [yearA, monthA, dayA] = a.dueDate.split("-").map(Number);
              const [hoursA, minutesA] = (a.dueTime || "23:59")
                .split(":")
                .map(Number);
              const dueA = new Date(yearA, monthA - 1, dayA, hoursA, minutesA);

              const [yearB, monthB, dayB] = b.dueDate.split("-").map(Number);
              const [hoursB, minutesB] = (b.dueTime || "23:59")
                .split(":")
                .map(Number);
              const dueB = new Date(yearB, monthB - 1, dayB, hoursB, minutesB);

              return dueA.getTime() - dueB.getTime();
            });
          const nextAssignment = upcomingAssessments[0] || null;

          courseStatsList.push({
            courseName,
            totalAssessments: assessments.length,
            pendingAssessments: assessments.length - completed.length,
            completedAssessments: completed.length,
            nextDueDate: nextAssignment ? nextAssignment.dueDate : null,
            nextAssignment: nextAssignment
              ? nextAssignment.assignmentName
              : null,
            progress:
              assessments.length > 0
                ? Math.round((completed.length / assessments.length) * 100)
                : 0,
          });
        });

        setCourses(courseStatsList);
      } catch (err) {
        console.error("Error fetching course data:", err);
        setError("Failed to load course overview data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [user, semesterId]);

  const sortedCourses = [...courses].sort((a, b) => {
    if (!a.nextDueDate && !b.nextDueDate) return 0;
    if (!a.nextDueDate) return 1;
    if (!b.nextDueDate) return -1;
    const dateA = new Date(a.nextDueDate);
    const dateB = new Date(b.nextDueDate);
    return dateA.getTime() - dateB.getTime();
  });

  const formatDate = (dateStr: string | null) => {
    return formatLocalDate(dateStr);
  };

  const isUpcoming = (dateStr: string | null) => {
    if (!dateStr) return false;
    return isDateUpcoming(dateStr);
  };


  if (error) return <div className="text-light-error-text dark:text-dark-error-text">{error}</div>;
  if (courses.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-6">
          Your Courses
        </h2>
        <div className="text-center py-10 text-light-text-tertiary dark:text-dark-text-tertiary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-4 text-light-text-tertiary dark:text-dark-text-tertiary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <p className="text-base font-medium mb-2 text-light-text-primary dark:text-dark-text-primary">
            No courses yet
          </p>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Add your first assessment to get started with course tracking.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-medium text-light-text-primary dark:text-dark-text-primary mb-6">
        Your Courses
      </h2>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-light-border-secondary dark:border-dark-border-secondary border-t-light-button-primary dark:border-t-dark-button-primary"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-light-error-bg dark:bg-dark-error-bg rounded-lg text-light-error-text dark:text-dark-error-text animate-fade-in">
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Headers */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-light-bg-secondary/50 dark:bg-dark-bg-tertiary/50 rounded-lg">
            <div className="col-span-12 lg:col-span-2 flex items-center">
              <span className="text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                Course
              </span>
            </div>
            <div className="col-span-12 lg:col-span-1 flex items-center">
              <span className="text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                Total
              </span>
            </div>
            <div className="col-span-12 lg:col-span-1 flex items-center">
              <span className="text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                Pending
              </span>
            </div>
            <div className="col-span-12 lg:col-span-3 flex items-center">
              <span className="text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                Progress
              </span>
            </div>
            <div className="col-span-12 lg:col-span-4 flex items-center">
              <span className="text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                Next Due
              </span>
            </div>
            <div className="col-span-12 lg:col-span-1 flex items-center justify-end">
              <span className="text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                Actions
              </span>
            </div>
          </div>

          {/* Course Cards */}
          <div className="space-y-2">
            {sortedCourses.map((course) => (
              <div
                key={course.courseName}
                className="bg-light-bg-secondary/50 dark:bg-dark-bg-tertiary/30 rounded-lg transition-all duration-300 p-3"
              >
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-12 lg:col-span-2">
                    <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary text-sm">
                      {course.courseName}
                    </h3>
                  </div>
                  <div className="col-span-12 lg:col-span-1">
                    <span className="text-light-text-secondary dark:text-dark-text-secondary text-sm">
                      {course.totalAssessments}
                    </span>
                  </div>
                  <div className="col-span-12 lg:col-span-1">
                    {course.pendingAssessments > 0 ? (
                      <span
                        className={`font-medium text-sm ${
                          course.pendingAssessments > 2
                            ? "text-light-warning-text dark:text-dark-warning-text"
                            : "text-light-text-primary dark:text-dark-text-primary"
                        }`}
                      >
                        {course.pendingAssessments}
                      </span>
                    ) : (
                      <span className="text-light-success-text dark:text-dark-success-text font-medium text-sm">
                        All done!
                      </span>
                    )}
                  </div>
                  <div className="col-span-12 lg:col-span-3">
                    <div className="max-w-[200px] bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full bg-light-button-primary dark:bg-dark-button-primary"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1 inline-block">
                      {course.progress}% complete
                    </span>
                  </div>
                  <div className="col-span-12 lg:col-span-4">
                    {course.nextDueDate ? (
                      <div>
                        <div
                          className={`font-medium whitespace-nowrap ${
                            isUpcoming(course.nextDueDate)
                              ? "text-light-warning-text dark:text-dark-warning-text"
                              : "dark:text-dark-text-primary"
                          }`}
                        >
                          {formatDate(course.nextDueDate)}
                        </div>
                        <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary truncate max-w-[200px]">
                          {course.nextAssignment}
                        </div>
                      </div>
                    ) : (
                      <span className="text-light-text-tertiary dark:text-dark-text-tertiary">
                        -
                      </span>
                    )}
                  </div>
                  <div className="col-span-12 lg:col-span-1 flex items-center justify-end">
                    <button
                      onClick={() => onSelectCourse(course.courseName)}
                      className="text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-secondary dark:hover:text-dark-text-secondary p-1 hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary rounded-md transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default CoursesOverviewTable;
