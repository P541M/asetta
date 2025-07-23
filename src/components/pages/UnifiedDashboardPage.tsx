import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { TabProvider, useTab, TabType } from "../../contexts/TabContext";
import DashboardLayout from "../layout/DashboardLayout";
import {
  DashboardData,
  TabComponentProps,
  CoursesTabProps,
} from "../../types/dashboard";

// Import existing tab content components
import CoursesOverviewTable from "../tables/CoursesOverviewTable";
import AssessmentsTable from "../tables/AssessmentsTable";
import CourseFilteredAssessments from "../assessment/CourseFilteredAssessments";
import GradeCalculator from "../assessment/GradeCalculator";
import CalendarView from "../calendar/CalendarView";
import AddAssessmentForm from "../forms/AddAssessmentForm";
import UploadForm from "../forms/UploadForm";
import { ErrorMessage, EmptyState } from "../ui";

interface UnifiedDashboardPageProps {
  forceSemesterId?: string;
}

// Courses Tab Component
const CoursesTab = ({ data, onSelectCourse }: CoursesTabProps) => {
  const { error, courses } = data;

  return (
    <>
      {error ? (
        <ErrorMessage message={error} />
      ) : (
        <CoursesOverviewTable
          courses={courses}
          onSelectCourse={onSelectCourse}
        />
      )}
    </>
  );
};

// Assessments Tab Component
const AssessmentsTab = ({ data }: { data: DashboardData }) => {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const { selectedSemesterId, assessments, error, refreshAssessments } = data;

  useEffect(() => {
    if (router.query.course && typeof router.query.course === "string") {
      setSelectedCourse(decodeURIComponent(router.query.course));
    } else {
      setSelectedCourse(null);
    }
  }, [router.query.course]);

  const handleClearCourseSelection = () => {
    setSelectedCourse(null);
    const newQuery = { ...router.query };
    delete newQuery.course;
    router.replace({ pathname: router.pathname, query: newQuery }, undefined, {
      shallow: true,
    });
  };

  return (
    <div>
      {selectedCourse ? (
        <CourseFilteredAssessments
          semesterId={selectedSemesterId}
          selectedCourse={selectedCourse}
          onBack={handleClearCourseSelection}
        />
      ) : (
        <>
          {error ? (
            <ErrorMessage message={error} />
          ) : (
            <AssessmentsTable
              assessments={assessments}
              semesterId={selectedSemesterId}
              onStatusChange={refreshAssessments}
            />
          )}
        </>
      )}
    </div>
  );
};

// Grades Tab Component
const GradesTab = ({ data, urlSemesterId }: TabComponentProps) => {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const { selectedSemester, selectedSemesterId, availableCourses } = data;

  useEffect(() => {
    if (router.query.course && typeof router.query.course === "string") {
      const courseFromUrl = decodeURIComponent(router.query.course);
      setSelectedCourse(courseFromUrl);
    }
  }, [router.query.course]);

  // Auto-select first course if none selected and courses are available
  if (!selectedCourse && availableCourses.length > 0) {
    setSelectedCourse(availableCourses[0]);
  }

  const handleAddAssessment = () => {
    const basePath = urlSemesterId
      ? `/dashboard/${urlSemesterId}`
      : "/dashboard";
    router.push(`${basePath}?tab=add`);
  };

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
            <h2 className="text-xl font-medium text-light-text-primary dark:text-dark-text-primary">
              Grade Calculator
            </h2>
            <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
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
              onChange={(e) => setSelectedCourse(e.target.value || null)}
              className="input bg-white dark:bg-dark-bg-tertiary py-1.5 px-3 text-sm dark:text-dark-text-primary dark:border-dark-border-primary min-w-48"
              disabled={availableCourses.length === 0}
            >
              <option value="">Select a course...</option>
              {availableCourses.map((course: string) => (
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
              <button onClick={handleAddAssessment} className="btn-primary">
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
};

// Calendar Tab Component
const CalendarTab = ({ data }: { data: DashboardData }) => {
  const { selectedSemester, selectedSemesterId } = data;

  return (
    <CalendarView
      selectedSemester={selectedSemester}
      semesterId={selectedSemesterId}
    />
  );
};

// Add Assessment Tab Component
const AddTab = ({ data, urlSemesterId }: TabComponentProps) => {
  const [addMode, setAddMode] = useState<"manual" | "upload">("upload");
  const { selectedSemester, selectedSemesterId, refreshAssessments } = data;

  return (
    <div>
      {selectedSemesterId ? (
        <div className="p-6">
          <h2 className="text-xl font-medium text-light-text-primary dark:text-dark-text-primary mb-6">
            Add Assessment for {selectedSemester}
          </h2>

          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setAddMode("upload")}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                addMode === "upload"
                  ? "bg-light-button-primary text-white shadow-sm dark:bg-dark-button-primary"
                  : "bg-gray-50 dark:bg-dark-bg-tertiary text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-hover"
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => setAddMode("manual")}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                addMode === "manual"
                  ? "bg-light-button-primary text-white shadow-sm dark:bg-dark-button-primary"
                  : "bg-gray-50 dark:bg-dark-bg-tertiary text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-hover"
              }`}
            >
              Quick Add
            </button>
          </div>

          {addMode === "upload" ? (
            <UploadForm
              semesterId={selectedSemesterId}
              semesterName={selectedSemester}
              onUploadSuccess={refreshAssessments}
            />
          ) : (
            <AddAssessmentForm
              semesterId={selectedSemesterId}
              onSuccess={refreshAssessments}
            />
          )}
        </div>
      ) : (
        <div className="p-6 text-center">
          <p className="text-gray-600 dark:text-dark-text-secondary">
            {urlSemesterId
              ? "Unable to load semester data. Please check the URL or return to the dashboard."
              : "Please select a semester to add assessments."}
          </p>
        </div>
      )}
    </div>
  );
};

// Main Content Component (with tab context)
const DashboardContent = ({ urlSemesterId }: { urlSemesterId?: string }) => {
  const router = useRouter();
  const { activeTab } = useTab();

  const handleSelectCourse = (courseName: string) => {
    // Switch to assessments tab and set course filter
    const newQuery = {
      ...router.query,
      tab: "assessments",
      course: encodeURIComponent(courseName),
    };
    router.replace({ pathname: router.pathname, query: newQuery }, undefined, {
      shallow: true,
    });
  };

  return (
    <DashboardLayout
      title="Dashboard | Asetta"
      description="Manage your semesters, track assessments, and stay organized with Asetta."
      forceSemesterId={urlSemesterId}
    >
      {(data) => (
        <div>
          {/* Render tab content based on active tab */}
          <div style={{ display: activeTab === "courses" ? "block" : "none" }}>
            <CoursesTab data={data} onSelectCourse={handleSelectCourse} />
          </div>

          <div
            style={{ display: activeTab === "assessments" ? "block" : "none" }}
          >
            <AssessmentsTab data={data} />
          </div>

          <div style={{ display: activeTab === "grades" ? "block" : "none" }}>
            <GradesTab data={data} urlSemesterId={urlSemesterId} />
          </div>

          <div style={{ display: activeTab === "calendar" ? "block" : "none" }}>
            <CalendarTab data={data} />
          </div>

          <div style={{ display: activeTab === "add" ? "block" : "none" }}>
            <AddTab data={data} urlSemesterId={urlSemesterId} />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

// Main Component (wraps with TabProvider)
const UnifiedDashboardPage = ({
  forceSemesterId,
}: UnifiedDashboardPageProps) => {
  const router = useRouter();
  const urlSemesterId = forceSemesterId || (router.query.semester as string);

  // Determine initial tab from URL
  const getInitialTab = (): TabType => {
    if (router.query.tab && typeof router.query.tab === "string") {
      const tab = router.query.tab as TabType;
      if (
        ["courses", "assessments", "grades", "calendar", "add"].includes(tab)
      ) {
        return tab;
      }
    }

    // Default based on pathname (for backward compatibility)
    if (router.pathname.includes("/courses")) return "courses";
    if (router.pathname.includes("/assessments")) return "assessments";
    if (router.pathname.includes("/grades")) return "grades";
    if (router.pathname.includes("/calendar")) return "calendar";
    if (router.pathname.includes("/add")) return "add";

    return "assessments"; // Default tab
  };

  return (
    <TabProvider initialTab={getInitialTab()}>
      <DashboardContent urlSemesterId={urlSemesterId} />
    </TabProvider>
  );
};

export default UnifiedDashboardPage;
