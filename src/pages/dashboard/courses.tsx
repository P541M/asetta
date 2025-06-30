import { useRouter } from "next/router";
import DashboardLayout from "../../components/layout/DashboardLayout";
import CoursesOverviewTable from "../../components/tables/CoursesOverviewTable";

const CoursesPage = () => {
  const router = useRouter();

  const handleSelectCourse = (courseName: string) => {
    router.push(`/dashboard/assessments?course=${encodeURIComponent(courseName)}`);
  };

  return (
    <DashboardLayout
      title="Courses - Asetta"
      description="View course overview and statistics for your current semester."
    >
      {({
        selectedSemesterId,
        isLoading,
        error,
      }) => (
        <div className="animate-fade-in">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 dark:border-primary-400"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 rounded-md text-red-700 animate-fade-in shadow-sm">
              <p>{error}</p>
            </div>
          ) : (
            <CoursesOverviewTable
              semesterId={selectedSemesterId}
              onSelectCourse={handleSelectCourse}
            />
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default CoursesPage;