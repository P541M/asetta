import { CircleAlert, FileText } from "lucide-react";
import { useAssessments } from "../../hooks/useAssessments";
import AssessmentsTable from "../tables/AssessmentsTable";
import { CourseFilteredAssessmentsProps } from "../../types/course";
import { resolveCourseColor } from "../../constants/courseColors";
import { Alert, AlertDescription } from "../ui/alert";
import CourseColorDot from "../ui/CourseColorDot";
import EmptyState from "../ui/EmptyState";
import LoadingSpinner from "../ui/LoadingSpinner";
import PanelHeader from "../ui/PanelHeader";

const CourseFilteredAssessments = ({
  semesterId,
  selectedCourse,
  onBack,
  courseColors,
}: CourseFilteredAssessmentsProps) => {
  const {
    assessments,
    loading: isLoading,
    error,
    refetch,
  } = useAssessments(semesterId, {
    courseName: selectedCourse,
  });

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

  if (isLoading || error || assessments.length === 0) {
    return (
      <div className="p-6">
        <PanelHeader title={breadcrumb} />
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
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
      onStatusChange={refetch}
      courseColors={courseColors}
    />
  );
};

export default CourseFilteredAssessments;
