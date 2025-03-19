// src/components/CoursesOverviewTable.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, getDocs } from "firebase/firestore";

interface Assessment {
  id: string;
  courseName: string;
  assignmentName: string;
  dueDate: string;
  weight: number;
  status: string;
}

interface CourseStats {
  courseName: string;
  totalAssessments: number;
  pendingAssessments: number;
  completedAssessments: number;
  nextDueDate: string | null;
  nextAssignment: string | null;
  progress: number; // Percentage of completed assessments
}

interface CoursesOverviewTableProps {
  semesterId: string;
  onSelectCourse: (courseName: string) => void;
}

const CoursesOverviewTable = ({
  semesterId,
  onSelectCourse,
}: CoursesOverviewTableProps) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof CourseStats>("courseName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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
        const assessmentsList: Assessment[] = [];

        querySnapshot.forEach((doc) => {
          assessmentsList.push({
            id: doc.id,
            ...(doc.data() as Omit<Assessment, "id">),
          });
        });

        // Group assessments by course
        const courseMap = new Map<string, Assessment[]>();

        assessmentsList.forEach((assessment) => {
          if (!courseMap.has(assessment.courseName)) {
            courseMap.set(assessment.courseName, []);
          }
          courseMap.get(assessment.courseName)?.push(assessment);
        });

        // Calculate stats for each course
        const courseStatsList: CourseStats[] = [];

        courseMap.forEach((assessments, courseName) => {
          // Submission statuses
          const completedStatuses = ["Submitted", "Under Review", "Completed"];
          const completed = assessments.filter((a) =>
            completedStatuses.includes(a.status)
          );

          // Find next due assessment
          const now = new Date();
          const upcomingAssessments = assessments
            .filter(
              (a) =>
                !completedStatuses.includes(a.status) &&
                new Date(a.dueDate) >= now
            )
            .sort(
              (a, b) =>
                new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            );

          const nextAssignment =
            upcomingAssessments.length > 0 ? upcomingAssessments[0] : null;

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

  const handleSort = (field: keyof CourseStats) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, set to ascending by default
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedCourses = [...courses].sort((a, b) => {
    // Special case for dates
    if (sortField === "nextDueDate") {
      // Handle null values
      if (!a.nextDueDate && !b.nextDueDate) return 0;
      if (!a.nextDueDate) return sortDirection === "asc" ? 1 : -1;
      if (!b.nextDueDate) return sortDirection === "asc" ? -1 : 1;

      const dateA = new Date(a.nextDueDate);
      const dateB = new Date(b.nextDueDate);
      return sortDirection === "asc"
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    }

    // For other fields
    const fieldA = a[sortField];
    const fieldB = b[sortField];

    if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Format date for display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  // Check if a due date is upcoming (within 7 days)
  const isUpcoming = (dateStr: string | null) => {
    if (!dateStr) return false;

    const now = new Date();
    const dueDate = new Date(dateStr);
    const diffDays = Math.round(
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return diffDays >= 0 && diffDays <= 7;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg text-red-700 animate-fade-in">
        <p>{error}</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 animate-fade-in">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto mb-4 text-gray-300 animate-bounce-light"
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
        <p className="text-lg font-medium mb-2">No courses found</p>
        <p>
          Add assessments manually or upload a course outline to get started.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-medium text-gray-900 mb-6">Your Courses</h2>
      <div className="table-container rounded-lg shadow-sm border border-gray-100">
        <table className="data-table">
          <thead>
            <tr>
              <th
                className="cursor-pointer"
                onClick={() => handleSort("courseName")}
              >
                <div className="flex items-center space-x-1 group">
                  <span className="group-hover:text-indigo-600 transition-colors duration-200">
                    Course
                  </span>
                  {sortField === "courseName" && (
                    <span className="text-indigo-600">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="cursor-pointer"
                onClick={() => handleSort("totalAssessments")}
              >
                <div className="flex items-center space-x-1 group">
                  <span className="group-hover:text-indigo-600 transition-colors duration-200">
                    Total
                  </span>
                  {sortField === "totalAssessments" && (
                    <span className="text-indigo-600">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="cursor-pointer"
                onClick={() => handleSort("pendingAssessments")}
              >
                <div className="flex items-center space-x-1 group">
                  <span className="group-hover:text-indigo-600 transition-colors duration-200">
                    Pending
                  </span>
                  {sortField === "pendingAssessments" && (
                    <span className="text-indigo-600">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="cursor-pointer"
                onClick={() => handleSort("progress")}
              >
                <div className="flex items-center space-x-1 group">
                  <span className="group-hover:text-indigo-600 transition-colors duration-200">
                    Progress
                  </span>
                  {sortField === "progress" && (
                    <span className="text-indigo-600">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="cursor-pointer"
                onClick={() => handleSort("nextDueDate")}
              >
                <div className="flex items-center space-x-1 group">
                  <span className="group-hover:text-indigo-600 transition-colors duration-200">
                    Next Due
                  </span>
                  {sortField === "nextDueDate" && (
                    <span className="text-indigo-600">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCourses.map((course) => (
              <tr key={course.courseName}>
                <td className="font-medium">{course.courseName}</td>
                <td>{course.totalAssessments}</td>
                <td>
                  {course.pendingAssessments > 0 ? (
                    <span
                      className={`font-medium ${
                        course.pendingAssessments > 2 ? "text-amber-600" : ""
                      }`}
                    >
                      {course.pendingAssessments}
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-medium">
                      All done!
                    </span>
                  )}
                </td>
                <td>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full bg-indigo-600"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 inline-block">
                    {course.progress}% complete
                  </span>
                </td>
                <td>
                  {course.nextDueDate ? (
                    <div>
                      <div
                        className={`font-medium ${
                          isUpcoming(course.nextDueDate) ? "text-amber-600" : ""
                        }`}
                      >
                        {formatDate(course.nextDueDate)}
                      </div>
                      <div
                        className="text-sm text-gray-500 truncate max-w-[200px]"
                        title={course.nextAssignment || ""}
                      >
                        {course.nextAssignment}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="text-center">
                  <button
                    onClick={() => onSelectCourse(course.courseName)}
                    className="btn-primary py-1 px-3 text-sm hover:shadow-sm flex items-center justify-center mx-auto"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
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
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CoursesOverviewTable;
