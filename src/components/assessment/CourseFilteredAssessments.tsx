// src/components/assessment/CourseFilteredAssessments.tsx
import { ArrowLeft, CircleAlert, FileText } from "lucide-react";
import { useAssessments } from "../../hooks/useAssessments";
import AssessmentsTable from "../tables/AssessmentsTable";
import { CourseFilteredAssessmentsProps } from "../../types/course";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import EmptyState from "../ui/EmptyState";
import LoadingSpinner from "../ui/LoadingSpinner";

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
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="px-6 pb-6">
          <Alert variant="destructive">
            <CircleAlert aria-hidden />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      ) : assessments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No assessments in this course yet"
          description="Add assessments manually or upload a course outline."
        />
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
