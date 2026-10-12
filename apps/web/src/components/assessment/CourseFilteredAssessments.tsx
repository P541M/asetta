import { useMemo } from "react";
import { CircleAlert, FileText } from "lucide-react";
import AssessmentsTable from "../tables/AssessmentsTable";
import { CourseFilteredAssessmentsProps } from "../../types/course";
import { resolveCourseColor } from "../../constants/courseColors";
import { Alert, AlertDescription } from "../ui/alert";
import CourseColorDot from "../ui/CourseColorDot";
import EmptyState from "../ui/EmptyState";
import PanelHeader from "../ui/PanelHeader";

const CourseFilteredAssessments = ({
  assessments: semesterAssessments,
  error,
  semesterId,
  selectedCourse,
  onBack,
  courseColors,
}: CourseFilteredAssessmentsProps) => {
  // Memoized so the table's local copy only resyncs when the live data changes
  const assessments = useMemo(
    () => semesterAssessments.filter((assessment) => assessment.courseName === selectedCourse),
    [semesterAssessments, selectedCourse],
  );

  const courseColor = resolveCourseColor(courseColors[selectedCourse], selectedCourse);

  /* Breadcrumb title: "Courses" navigates back, the course name is the current
     location. Inherits the section-heading tier from PanelHeader's h2. */
  const breadcrumb = (
    <span className="flex min-w-0 items-center gap-2">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back to all courses"
        className="shrink-0 rounded-sm text-muted-foreground outline-hidden transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        Courses
      </button>
      <span aria-hidden className="shrink-0 font-normal text-muted-foreground/60">
        /
      </span>
      <span className="flex min-w-0 items-center gap-2">
        <CourseColorDot color={courseColor} />
        <span className="truncate">{selectedCourse}</span>
      </span>
    </span>
  );

  if (error || assessments.length === 0) {
    return (
      <div className="p-6">
        <PanelHeader title={breadcrumb} />
        {error ? (
          <Alert variant="destructive">
            <CircleAlert aria-hidden />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <EmptyState
            icon={FileText}
            title="No assessments in this course yet"
            description="Add assessments manually or upload a course outline."
          />
        )}
      </div>
    );
  }

  return (
    <AssessmentsTable
      title={breadcrumb}
      assessments={assessments}
      semesterId={semesterId}
      courseColors={courseColors}
    />
  );
};

export default CourseFilteredAssessments;
