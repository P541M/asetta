import { memo, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { BookOpen, Check, ChevronsUpDown, CircleAlert, GraduationCap, Loader2 } from "lucide-react";
import { TabProvider, useTab, TabType } from "../../contexts/TabContext";
import DashboardLayout from "../layout/DashboardLayout";
import { DashboardData, TabComponentProps, CoursesTabProps } from "../../types/dashboard";
import { resolveCourseColor } from "../../constants/courseColors";

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
import CourseColorDot from "../ui/CourseColorDot";
import EmptyState from "../ui/EmptyState";
import PanelHeader from "../ui/PanelHeader";

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

/* The five tab panels stay mounted (display-toggled) so their state survives
   switching; memo keeps the hidden ones from re-rendering on every interaction. */

// Courses Tab Component
const CoursesTab = memo(function CoursesTab({ data, onSelectCourse }: CoursesTabProps) {
  const { error, courses, selectedSemesterId, refreshAssessments, courseColors, setCourseColor } =
    data;

  return (
    <>
      {error ? (
        <TabError message={error} />
      ) : (
        <CoursesOverviewTable
          courses={courses}
          onSelectCourse={onSelectCourse}
          semesterId={selectedSemesterId}
          onCourseRenamed={refreshAssessments}
          courseColors={courseColors}
          setCourseColor={setCourseColor}
        />
      )}
    </>
  );
});

// Assessments Tab Component
const AssessmentsTab = memo(function AssessmentsTab({ data }: { data: DashboardData }) {
  const router = useRouter();
  const { setActiveTab } = useTab();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const { selectedSemesterId, assessments, error, refreshAssessments, courseColors } = data;

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
          courseColors={courseColors}
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
              courseColors={courseColors}
            />
          )}
        </>
      )}
    </div>
  );
});

// Grades Tab Component
const GradesTab = memo(function GradesTab({ data, urlSemesterId }: TabComponentProps) {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [autoSaveError, setAutoSaveError] = useState<string | undefined>();
  const { selectedSemesterId, availableCourses, courseColors } = data;

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

  const handleAutoSaveStatusChange = useCallback(
    (status: "idle" | "saving" | "saved" | "error", error?: string) => {
      setAutoSaveStatus(status);
      setAutoSaveError(error);
    },
    [],
  );

  if (!selectedSemesterId) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="No semester selected"
        description="Select a semester above to view grade calculations for your courses."
      />
    );
  }

  return (
    <div className="p-6">
      <PanelHeader
        title="Grade calculator"
        actions={
          <>
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
                  <span className="flex min-w-0 items-center gap-1.5">
                    {selectedCourse && (
                      <CourseColorDot
                        color={resolveCourseColor(courseColors[selectedCourse], selectedCourse)}
                      />
                    )}
                    <span className="min-w-0 truncate">{selectedCourse || "Select a course"}</span>
                  </span>
                  <ChevronsUpDown className="text-muted-foreground" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                {availableCourses.map((course: string) => (
                  <DropdownMenuItem
                    key={course}
                    data-selected={selectedCourse === course}
                    onSelect={() => setSelectedCourse(course)}
                  >
                    <CourseColorDot color={resolveCourseColor(courseColors[course], course)} />
                    <span className="truncate">{course}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      {availableCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="This semester doesn't have any assessments yet."
          action={
            <Button type="button" onClick={handleAddAssessment}>
              Add assessment
            </Button>
          }
        />
      ) : (
        <GradeCalculator
          semesterId={selectedSemesterId}
          selectedCourse={selectedCourse}
          onAutoSaveStatusChange={handleAutoSaveStatusChange}
        />
      )}
    </div>
  );
});

// Calendar Tab Component
const CalendarTab = memo(function CalendarTab({ data }: { data: DashboardData }) {
  const { selectedSemester, selectedSemesterId, refreshTrigger } = data;

  return (
    <CalendarView
      selectedSemester={selectedSemester}
      semesterId={selectedSemesterId}
      refreshTrigger={refreshTrigger}
    />
  );
});

// Add Assessment Tab Component
const AddTab = memo(function AddTab({ data, urlSemesterId }: TabComponentProps) {
  const { selectedSemester, selectedSemesterId, refreshAssessments } = data;

  return (
    <div>
      {selectedSemesterId ? (
        <div className="p-6">
          <PanelHeader title="Add assessments" />

          <UploadForm
            semesterId={selectedSemesterId}
            semesterName={selectedSemester}
            onUploadSuccess={refreshAssessments}
          />

          {/* Typographic rule between the two paths */}
          <div className="my-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">or add one manually</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <AddAssessmentForm semesterId={selectedSemesterId} onSuccess={refreshAssessments} />
        </div>
      ) : (
        <EmptyState
          icon={GraduationCap}
          title={urlSemesterId ? "Semester not found" : "No semester selected"}
          description={
            urlSemesterId
              ? "Check the URL or head back to your dashboard."
              : "Select a semester above to add assessments."
          }
        />
      )}
    </div>
  );
});

// Main Content Component (with tab context)
const DashboardContent = ({ urlSemesterId }: { urlSemesterId?: string }) => {
  const router = useRouter();
  const { activeTab } = useTab();

  const handleSelectCourse = useCallback(
    (courseName: string) => {
      // Switch to assessments tab and set course filter
      const newQuery = {
        ...router.query,
        tab: "assessments",
        course: encodeURIComponent(courseName),
      };
      router.replace({ pathname: router.pathname, query: newQuery }, undefined, {
        shallow: true,
      });
    },
    [router],
  );

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
