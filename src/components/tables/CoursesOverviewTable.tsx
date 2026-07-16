import { useState } from "react";
import { useRouter } from "next/router";
import { BookOpen, Pencil } from "lucide-react";
import { formatLocalDate, isUpcoming as isDateUpcoming } from "../../utils/dateUtils";
import { CoursesOverviewTableProps } from "../../types/course";
import { useTab } from "../../contexts/TabContext";
import { useCourseRename } from "../../hooks/useCourseRename";
import { getProgressBarColor } from "../../utils/gradeCalculations";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import EmptyState from "../ui/EmptyState";
import PanelHeader from "../ui/PanelHeader";

const CoursesOverviewTable = ({
  courses,
  onSelectCourse,
  semesterId,
  onCourseRenamed,
}: CoursesOverviewTableProps) => {
  const router = useRouter();
  const { setActiveTab } = useTab();
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => {
          const isUpcoming = course.nextDueDate ? isDateUpcoming(course.nextDueDate) : false;

          return (
            <div
              key={course.courseName}
              role="button"
              tabIndex={0}
              onClick={() => onSelectCourse(course.courseName)}
              onKeyDown={(e) => {
                // Only when the card itself is focused; ignore keys from the rename controls
                if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onSelectCourse(course.courseName);
                }
              }}
              aria-label={`View ${course.courseName} assessments`}
              className="cursor-pointer rounded-xl bg-secondary/50 p-6 outline-hidden transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {editingCourse === course.courseName ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handleEditSubmit(course.courseName)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        handleKeyDown(e, course.courseName);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="h-9"
                      aria-label="Course name"
                      autoFocus
                      disabled={isRenaming}
                    />
                  ) : (
                    <div className="group flex items-center gap-1">
                      <h3 className="line-clamp-2 flex-1 text-base font-semibold text-foreground">
                        {isRenaming && editingCourse === course.courseName
                          ? "Updating..."
                          : course.courseName}
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
                </div>
                <div className="flex shrink-0 flex-col items-end">
                  <span className="text-xl font-semibold text-foreground md:text-2xl">
                    {course.progress}%
                  </span>
                  <div className="mt-1 h-1.5 w-12 rounded-full bg-foreground/10">
                    <div
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        getProgressBarColor(course.progress),
                      )}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total</p>
                  <p className="mt-1 text-xl font-semibold text-foreground">
                    {course.totalAssessments}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Pending</p>
                  <p className="mt-1 text-xl font-semibold text-foreground">
                    {course.pendingAssessments}
                  </p>
                </div>
              </div>

              {course.nextDueDate && course.nextAssignment && (
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-medium text-muted-foreground">Next due</p>
                  <p className="mt-1 line-clamp-2 text-sm font-medium text-foreground">
                    {course.nextAssignment}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    {formatLocalDate(course.nextDueDate)}
                    {isUpcoming && (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Upcoming
                      </span>
                    )}
                  </p>
                </div>
              )}

              {!course.nextDueDate && (
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-medium text-success">All assessments completed</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CoursesOverviewTable;
