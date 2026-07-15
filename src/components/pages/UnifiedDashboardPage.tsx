import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { BookOpen, Check, ChevronsUpDown, CircleAlert, GraduationCap, Loader2 } from "lucide-react";
import { TabProvider, useTab, TabType } from "../../contexts/TabContext";
import DashboardLayout from "../layout/DashboardLayout";
import { DashboardData, TabComponentProps, CoursesTabProps } from "../../types/dashboard";
import { cn } from "../../lib/utils";

// Import existing tab content components
import CoursesOverviewTable from "../tables/CoursesOverviewTable";
import AssessmentsTable from "../tables/AssessmentsTable";
import CourseFilteredAssessments from "../assessment/CourseFilteredAssessments";
import GradeCalculator from "../assessment/GradeCalculator";
import CalendarView from "../calendar/CalendarView";
import AddAssessmentForm from "../forms/AddAssessmentForm";
import UploadForm from "../forms/UploadForm";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import EmptyState from "../ui/EmptyState";

/** Inline error banner for tab content (padded to sit inside the panel). */
const TabError = ({ message }: { message: string }) => (
  <div className="p-6">
    <Alert variant="destructive">
      <CircleAlert aria-hidden />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  </div>
);

interface UnifiedDashboardPageProps {
  forceSemesterId?: string;
}

// Courses Tab Component
const CoursesTab = ({ data, onSelectCourse }: CoursesTabProps) => {
  const { error, courses, selectedSemesterId, refreshAssessments } = data;

  const handleCourseRenamed = () => {
    // Refresh assessments data to reflect the course name change
    refreshAssessments();
  };

  return (
    <>
      {error ? (
        <TabError message={error} />
      ) : (
        <CoursesOverviewTable
          courses={courses}
          onSelectCourse={onSelectCourse}
          semesterId={selectedSemesterId}
          onCourseRenamed={handleCourseRenamed}
        />
      )}
    </>
  );
};

// Assessments Tab Component
const AssessmentsTab = ({ data }: { data: DashboardData }) => {
  const router = useRouter();
  const { setActiveTab } = useTab();
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
    // Switch back to courses tab when clearing course selection
    newQuery.tab = "courses";
    router.replace({ pathname: router.pathname, query: newQuery }, undefined, {
      shallow: true,
    });
    setActiveTab("courses");
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
            <TabError message={error} />
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
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [autoSaveError, setAutoSaveError] = useState<string | undefined>();
  const { selectedSemesterId, availableCourses } = data;

  useEffect(() => {
    if (router.query.course && typeof router.query.course === "string") {
      const courseFromUrl = decodeURIComponent(router.query.course);
      setSelectedCourse(courseFromUrl);
    }
  }, [router.query.course]);

  // Auto-select first course if none selected and courses are available.
  // Deliberate "adjust state during render" (see react.dev: You Might Not Need an Effect):
  // the guard prevents loops, and unlike a useEffect this re-renders before paint,
  // so the tab never flashes an unselected state once courses load.
  if (!selectedCourse && availableCourses.length > 0) {
    setSelectedCourse(availableCourses[0]);
  }

  const handleAddAssessment = () => {
    const basePath = urlSemesterId ? `/dashboard/${urlSemesterId}` : "/dashboard";
    router.push(`${basePath}?tab=add`);
  };

  const handleAutoSaveStatusChange = (
    status: "idle" | "saving" | "saved" | "error",
    error?: string,
  ) => {
    setAutoSaveStatus(status);
    setAutoSaveError(error);
  };

  if (!selectedSemesterId) {
    return (
      <EmptyState
        icon={<GraduationCap className="size-12" aria-hidden />}
        title="No semester selected"
        description="Select a semester above to view grade calculations for your courses."
      />
    );
  }

  return (
    <div>
      <div className="p-6">
        {/* Header with course selection */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Grade calculator
            </h2>
            <p className="text-sm text-muted-foreground">{selectedCourse || "Select a course"}</p>
          </div>

          {/* Auto-save status & course selector */}
          <div className="flex items-center gap-4">
            {/* Feedback motion only: the indicator responds to a save the user triggered */}
            <div className="flex min-h-5 items-center">
              {autoSaveStatus === "saving" && (
                <span className="flex items-center gap-2 text-sm text-muted-foreground motion-safe:animate-fade-in">
                  <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden />
                  Saving...
                </span>
              )}
              {autoSaveStatus === "saved" && (
                <span className="flex items-center gap-2 text-sm text-success motion-safe:animate-fade-in">
                  <Check className="size-4" aria-hidden />
                  Saved
                </span>
              )}
              {autoSaveStatus === "error" && autoSaveError && (
                <span className="flex items-center gap-2 text-sm text-destructive motion-safe:animate-fade-in">
                  <CircleAlert className="size-4" aria-hidden />
                  Error saving
                </span>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  className="min-w-48 justify-between"
                  disabled={availableCourses.length === 0}
                  aria-label="Switch course"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <BookOpen className="text-muted-foreground" aria-hidden />
                    <span className="truncate">{selectedCourse || "Select a course"}</span>
                  </span>
                  <ChevronsUpDown className="text-muted-foreground" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                {availableCourses.map((course: string) => (
                  <DropdownMenuItem key={course} onSelect={() => setSelectedCourse(course)}>
                    <Check
                      className={cn(selectedCourse === course ? "opacity-100" : "opacity-0")}
                      aria-hidden
                    />
                    <span className="truncate">{course}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* No courses message */}
        {availableCourses.length === 0 && (
          <EmptyState
            icon={<BookOpen className="size-12" aria-hidden />}
            title="No courses found"
            description="This semester doesn't have any assessments yet."
            action={
              <Button type="button" onClick={handleAddAssessment}>
                Add assessment
              </Button>
            }
            className="py-10"
          />
        )}

        {/* Grade Calculator Component */}
        {availableCourses.length > 0 && (
          <GradeCalculator
            semesterId={selectedSemesterId}
            selectedCourse={selectedCourse}
            onAutoSaveStatusChange={handleAutoSaveStatusChange}
          />
        )}
      </div>
    </div>
  );
};

// Calendar Tab Component
const CalendarTab = ({ data }: { data: DashboardData }) => {
  const { selectedSemester, selectedSemesterId, refreshTrigger } = data;

  return (
    <CalendarView
      selectedSemester={selectedSemester}
      semesterId={selectedSemesterId}
      refreshTrigger={refreshTrigger}
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
          <h2 className="mb-6 text-xl font-semibold tracking-tight text-foreground">
            Add assessment
          </h2>

          {/* Mode toggle on the segmented-control language (see TabNavigationBar) */}
          <div className="mb-6 rounded-xl bg-secondary p-1">
            <div className="flex gap-1">
              {(
                [
                  { id: "upload", label: "Upload file" },
                  { id: "manual", label: "Quick add" },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={addMode === id}
                  onClick={() => setAddMode(id)}
                  className={cn(
                    "min-h-11 flex-1 rounded-lg px-4 text-sm font-medium outline-hidden transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring",
                    addMode === id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {addMode === "upload" ? (
            <UploadForm
              semesterId={selectedSemesterId}
              semesterName={selectedSemester}
              onUploadSuccess={refreshAssessments}
            />
          ) : (
            <AddAssessmentForm semesterId={selectedSemesterId} onSuccess={refreshAssessments} />
          )}
        </div>
      ) : (
        <div className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
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

          <div style={{ display: activeTab === "assessments" ? "block" : "none" }}>
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
const UnifiedDashboardPage = ({ forceSemesterId }: UnifiedDashboardPageProps) => {
  const router = useRouter();
  const urlSemesterId = forceSemesterId || (router.query.semester as string);

  // Determine initial tab from URL
  const getInitialTab = (): TabType => {
    if (router.query.tab && typeof router.query.tab === "string") {
      const tab = router.query.tab as TabType;
      if (["courses", "assessments", "grades", "calendar", "add"].includes(tab)) {
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
