// src/components/assessment/CourseFilteredAssessments.tsx
import { ArrowLeft, CircleAlert, FileText } from "lucide-react";
import { useAssessments } from "../../hooks/useAssessments";
import AssessmentsTable from "../tables/AssessmentsTable";
import { CourseFilteredAssessmentsProps } from "../../types/course";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";

const CourseFilteredAssessments = ({
  semesterId,
  selectedCourse,
  onBack,
}: CourseFilteredAssessmentsProps) => {
  const {
    assessments,
    loading: isLoading,
    error,
    refetch,
  } = useAssessments(semesterId, {
    courseName: selectedCourse,
  });

  const handleStatusChange = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 pt-6 px-6">
        <Button variant="link" size="sm" onClick={onBack} className="px-0">
          <ArrowLeft aria-hidden />
          Back to all courses
        </Button>
        <span className="truncate text-sm font-medium text-foreground">{selectedCourse}</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div
            className="size-10 rounded-full border-4 border-secondary border-t-primary motion-safe:animate-spin"
            role="status"
            aria-label="Loading assessments"
          />
        </div>
      ) : error ? (
        <div className="px-6 pb-6">
          <Alert variant="destructive">
            <CircleAlert aria-hidden />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      ) : assessments.length === 0 ? (
        <div className="px-6 pb-10 text-center">
          <FileText className="mx-auto mb-4 size-12 text-muted-foreground/50" aria-hidden />
          <p className="mb-2 text-base font-semibold text-foreground">
            No assessments found for this course
          </p>
          <p className="text-sm text-muted-foreground">
            This course doesn&apos;t have any assessments yet. Add assessments manually or upload a
            course outline.
          </p>
        </div>
      ) : (
        <AssessmentsTable
          assessments={assessments}
          semesterId={semesterId}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default CourseFilteredAssessments;
