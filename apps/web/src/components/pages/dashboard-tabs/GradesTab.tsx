import { memo, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { BookOpen, Check, ChevronsUpDown, CircleAlert, GraduationCap, Loader2 } from "lucide-react";
import { TabComponentProps } from "../../../types/dashboard";
import { resolveCourseColor } from "../../../constants/courseColors";
import GradeCalculator from "../../assessment/GradeCalculator";
import { Alert, AlertDescription } from "../../ui/alert";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import CourseColorDot from "../../ui/CourseColorDot";
import EmptyState from "../../ui/EmptyState";
import PanelHeader from "../../ui/PanelHeader";

const GradesTab = memo(function GradesTab({ data, urlSemesterId }: TabComponentProps) {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [autoSaveError, setAutoSaveError] = useState<string | undefined>();
  const { selectedSemesterId, assessments, availableCourses, error, courseColors } = data;

  useEffect(() => {
    if (router.query.course && typeof router.query.course === "string") {
      const courseFromUrl = decodeURIComponent(router.query.course);
      setSelectedCourse(courseFromUrl);
    }
  }, [router.query.course]);

  // Select the first course when none is selected, or when the selected one is gone (renamed
  // in another tab, or left over from another semester).
  // Deliberate "adjust state during render" (see react.dev: You Might Not Need an Effect):
  // the guard prevents loops, and unlike a useEffect this re-renders before paint,
  // so the tab never flashes an unselected state once courses load.
  if (
    availableCourses.length > 0 &&
    (!selectedCourse || !availableCourses.includes(selectedCourse))
  ) {
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

      {error ? (
        <Alert variant="destructive">
          <CircleAlert aria-hidden />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : availableCourses.length === 0 ? (
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
          // A new semester starts without the last one's unsaved edits
          key={selectedSemesterId}
          semesterId={selectedSemesterId}
          selectedCourse={selectedCourse}
          assessments={assessments}
          onAutoSaveStatusChange={handleAutoSaveStatusChange}
        />
      )}
    </div>
  );
});

export default GradesTab;
