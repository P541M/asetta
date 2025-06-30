import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import AssessmentsTable from "../../../components/tables/AssessmentsTable";
import CourseFilteredAssessments from "../../../components/assessment/CourseFilteredAssessments";

const SemesterAssessmentsPage = () => {
  const router = useRouter();
  const { semester: semesterId } = router.query;
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

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
      if (semesterId) {
        router.push(`/dashboard/${semesterId}/assessments`, undefined, { shallow: true });
      }
    };

    window.addEventListener("switchToAssessments", handleSwitchToAssessments);
    return () => {
      window.removeEventListener(
        "switchToAssessments",
        handleSwitchToAssessments
      );
    };
  }, [router, semesterId]);

  const handleClearCourseSelection = () => {
    setSelectedCourse(null);
    if (semesterId) {
      router.push(`/dashboard/${semesterId}/assessments`, undefined, { shallow: true });
    }
  };

  return (
    <DashboardLayout
      title="Assessments - Asetta"
      description="View and manage all your assessments for this semester."
      forceSemesterId={semesterId as string}
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
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 dark:border-primary-400"></div>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 rounded-md text-red-700 animate-fade-in shadow-sm">
                  <p>{error}</p>
                </div>
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

export default SemesterAssessmentsPage;