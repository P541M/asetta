import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../layout/DashboardLayout";
import AssessmentsTable from "../tables/AssessmentsTable";
import CourseFilteredAssessments from "../assessment/CourseFilteredAssessments";
import { ErrorMessage, SkeletonLoader } from "../ui";

interface AssessmentsPageProps {
  forceSemesterId?: string;
}

const AssessmentsPage = ({ forceSemesterId }: AssessmentsPageProps) => {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  // Extract semester ID from URL if this is a semester-specific route
  const urlSemesterId = forceSemesterId || (router.query.semester as string);

  useEffect(() => {
    if (router.query.course && typeof router.query.course === "string") {
      setSelectedCourse(decodeURIComponent(router.query.course));
    } else {
      setSelectedCourse(null);
    }
  }, [router.query.course]);

  useEffect(() => {
    const handleSwitchToAssessments = () => {
      setSelectedCourse(null);
      const basePath = urlSemesterId
        ? `/dashboard/${urlSemesterId}/assessments`
        : "/dashboard/assessments";
      router.push(basePath, undefined, { shallow: true });
    };

    window.addEventListener("switchToAssessments", handleSwitchToAssessments);
    return () => {
      window.removeEventListener(
        "switchToAssessments",
        handleSwitchToAssessments
      );
    };
  }, [router, urlSemesterId]);

  const handleClearCourseSelection = () => {
    setSelectedCourse(null);
    const basePath = urlSemesterId
      ? `/dashboard/${urlSemesterId}/assessments`
      : "/dashboard/assessments";
    router.push(basePath, undefined, { shallow: true });
  };

  return (
    <DashboardLayout
      title="Assessments | Asetta"
      description={
        urlSemesterId
          ? "View and manage all your assessments for this semester."
          : "View and manage all your assessments across courses and semesters."
      }
      forceSemesterId={urlSemesterId}
    >
      {({
        selectedSemesterId,
        assessments,
        isLoading,
        error,
        refreshAssessments,
      }) => (
        <div className="animate-fade-in">
          {selectedCourse ? (
            <CourseFilteredAssessments
              semesterId={selectedSemesterId}
              selectedCourse={selectedCourse}
              onBack={handleClearCourseSelection}
            />
          ) : (
            <>
              {isLoading && assessments.length === 0 ? (
                <SkeletonLoader type="table" rows={5} />
              ) : error ? (
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
      )}
    </DashboardLayout>
  );
};

export default AssessmentsPage;
