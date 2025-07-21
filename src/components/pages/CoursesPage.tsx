import { useRouter } from "next/router";
import DashboardLayout from "../layout/DashboardLayout";
import CoursesOverviewTable from "../tables/CoursesOverviewTable";
import { ErrorMessage } from "../ui";

interface CoursesPageProps {
  forceSemesterId?: string;
}

const CoursesPage = ({ forceSemesterId }: CoursesPageProps) => {
  const router = useRouter();

  // Extract semester ID from URL if this is a semester-specific route
  const urlSemesterId = forceSemesterId || (router.query.semester as string);

  const handleSelectCourse = (courseName: string) => {
    const basePath = urlSemesterId
      ? `/dashboard/${urlSemesterId}/assessments`
      : "/dashboard/assessments";
    router.push(`${basePath}?course=${encodeURIComponent(courseName)}`);
  };

  return (
    <DashboardLayout
      title="Courses | Asetta"
      description="View course overview and statistics for your current semester."
      forceSemesterId={urlSemesterId}
    >
      {({ courses, error }) => (
        <>
          {error ? (
            <ErrorMessage message={error} />
          ) : (
            <CoursesOverviewTable
              courses={courses}
              onSelectCourse={handleSelectCourse}
            />
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default CoursesPage;
