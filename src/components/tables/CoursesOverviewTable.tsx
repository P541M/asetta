import { useState } from "react";
import { useRouter } from "next/router";
import { BookOpen, CircleAlert, Pencil } from "lucide-react";
import { formatLocalDate, getDaysUntil } from "../../utils/dateUtils";
import { daysUntilLabel, urgencyChipClass } from "../../utils/urgency";
import { CoursesOverviewTableProps } from "../../types/course";
import { resolveCourseColor } from "../../constants/courseColors";
import { useTab } from "../../contexts/TabContext";
import { useCourseRename } from "../../hooks/useCourseRename";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import CourseColorDot from "../ui/CourseColorDot";
import CourseColorPicker from "../ui/CourseColorPicker";
import EmptyState from "../ui/EmptyState";
import PanelHeader from "../ui/PanelHeader";

const CoursesOverviewTable = ({
  courses,
  onSelectCourse,
  semesterId,
  onCourseRenamed,
  courseColors,
  setCourseColor,
}: CoursesOverviewTableProps) => {
  const router = useRouter();
  const { setActiveTab } = useTab();
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [colorError, setColorError] = useState<string | null>(null);

  const { renameCourse, isRenaming } = useCourseRename(semesterId, {
    onSuccess: (oldName, newName) => {
      setEditingCourse(null);
      onCourseRenamed?.();

      // Update navigation if user is currently viewing the renamed course
      if (router.query.course === oldName) {
        const newQuery = { ...router.query };
        newQuery.course = newName;
        router.replace({ pathname: router.pathname, query: newQuery }, undefined, {
          shallow: true,
        });
      }
    },
    onError: (error) => {
      console.error("Course rename failed:", error);
      setEditingCourse(null);
    },
  });

  const handleEditStart = (courseName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering course selection
    setEditingCourse(courseName);
    setEditValue(courseName);
  };

  const handleEditSubmit = async (oldName: string) => {
    const newName = editValue.trim();
    if (newName === oldName.trim() || !newName) {
      setEditingCourse(null);
      return;
    }

    await renameCourse(oldName, newName);
  };

  const handleKeyDown = (e: React.KeyboardEvent, courseName: string) => {
    if (e.key === "Enter") {
      handleEditSubmit(courseName);
    } else if (e.key === "Escape") {
      setEditingCourse(null);
    }
  };

  /* The live listener repaints from the local cache instantly, so no
     optimistic state is needed; a server rejection reverts the snapshot and
     we surface the alert. */
  const handleColorSelect = async (courseName: string, color: string) => {
    setColorError(null);
    try {
      await setCourseColor(courseName, color);
    } catch (error) {
      console.error("Error saving course color:", error);
      setColorError("Failed to save course color. Please try again.");
    }
  };

  if (courses.length === 0) {
    return (
      <div className="p-6">
        <PanelHeader title="Courses" />
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Add an assessment and its course will appear here."
          action={
            <Button type="button" onClick={() => setActiveTab("add")}>
              Add assessment
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <PanelHeader title="Courses" />

      {colorError && (
        <Alert variant="destructive" className="mb-4">
          <CircleAlert aria-hidden />
          <AlertDescription>{colorError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => {
          const daysUntilDue = course.nextDueDate ? getDaysUntil(course.nextDueDate) : null;
          const color = resolveCourseColor(courseColors[course.courseName], course.courseName);

          return (
            <div
              key={course.courseName}
              role="button"
              tabIndex={0}
              onClick={() => {
                /* A card with its editor open is not a navigation surface.
                   Also swallows the click the browser synthesizes ON the card
                   (nearest common ancestor) when a color-canvas drag starts in
                   the non-portaled popover and is released over the card. */
                if (editingCourse === course.courseName) return;
                onSelectCourse(course.courseName);
              }}
              onKeyDown={(e) => {
                // Only when the card itself is focused; ignore keys from the rename controls
                if (editingCourse === course.courseName) return;
                if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onSelectCourse(course.courseName);
                }
              }}
              aria-label={`View ${course.courseName} assessments`}
              className="group rounded-xl bg-secondary/50 p-5 outline-hidden transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              {/* Course name is the card's single emphasized element */}
              {editingCourse === course.courseName ? (
                <div
                  onBlur={(e) => {
                    /* Submit only when focus leaves the whole editor (input +
                       swatches) — a swatch click must never close it mid-pick */
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                      handleEditSubmit(course.courseName);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setEditingCourse(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      handleKeyDown(e, course.courseName);
                    }}
                    className="h-9"
                    aria-label="Course name"
                    autoFocus
                    disabled={isRenaming}
                  />
                  <div className="mt-3">
                    <CourseColorPicker
                      value={color}
                      onSelect={(newColor) => handleColorSelect(course.courseName, newColor)}
                      ariaLabel={`Change color for ${course.courseName}`}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex min-h-9 items-center gap-1">
                  <h3 className="line-clamp-2 min-w-0 flex-1 text-base font-semibold text-foreground">
                    <CourseColorDot
                      color={color}
                      className="mb-0.5 mr-2 inline-block align-middle"
                    />
                    {course.courseName}
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => handleEditStart(course.courseName, e)}
                    aria-label={`Rename ${course.courseName}`}
                    disabled={isRenaming}
                    className="shrink-0 text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <Pencil aria-hidden />
                  </Button>
                </div>
              )}

              {/* Quiet completion meter: amber while in progress, green when done */}
              <div className="mt-4">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      course.progress === 100 ? "bg-success" : "bg-primary",
                    )}
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {course.completedAssessments} of {course.totalAssessments} completed
                  </span>
                  <span className="text-xs font-medium tabular-nums text-muted-foreground">
                    {course.progress}%
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-border pt-4">
                {course.nextDueDate && course.nextAssignment ? (
                  <>
                    <p className="text-xs font-medium text-muted-foreground">Next due</p>
                    <p className="mt-1 truncate text-sm font-medium text-foreground">
                      {course.nextAssignment}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      {formatLocalDate(course.nextDueDate)}
                      {daysUntilDue !== null && (
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            urgencyChipClass(daysUntilDue),
                          )}
                        >
                          {daysUntilLabel(daysUntilDue)}
                        </span>
                      )}
                    </p>
                  </>
                ) : course.pendingAssessments === 0 ? (
                  <p className="text-sm font-medium text-success">All assessments completed</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No upcoming due dates</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CoursesOverviewTable;
