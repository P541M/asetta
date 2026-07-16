import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/router";
import Head from "next/head";
import SemesterTabs from "../assessment/SemesterTabs";
import DashboardHeader from "./DashboardHeader";
import TabNavigationBar from "./TabNavigationBar";
import { Assessment } from "../../types/assessment";
import { CourseStats } from "../../types/course";
import LoadingScreen from "../ui/LoadingScreen";
import LoadingSpinner from "../ui/LoadingSpinner";
import { useSemesters } from "../../hooks/useSemesters";
import { useSemesterAssessments, DashboardStats } from "../../hooks/useSemesterAssessments";
import { useDisplayPreferences } from "../../hooks/useDisplayPreferences";

interface DashboardLayoutProps {
  children: (props: {
    selectedSemester: string;
    selectedSemesterId: string;
    assessments: Assessment[];
    courses: CourseStats[];
    availableCourses: string[];
    error: string | null;
    stats: DashboardStats;
    refreshAssessments: () => void;
    refreshTrigger: number;
  }) => React.ReactNode;
  title?: string;
  description?: string;
  forceSemesterId?: string;
}

const DashboardLayout = ({
  children,
  title = "Asetta - Your Academic Dashboard",
  description = "Manage your semesters, track assessments, and stay organized with Asetta.",
  forceSemesterId,
}: DashboardLayoutProps) => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { showStatsBar } = useDisplayPreferences(user);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const {
    semesters,
    setSemesters,
    isLoading: semestersLoading,
    activeSemester,
  } = useSemesters(user, forceSemesterId);
  const selectedSemester = activeSemester?.name ?? "";
  const selectedSemesterId = activeSemester?.id ?? "";
  const { assessments, courses, availableCourses, isLoading, error, stats } =
    useSemesterAssessments(user, selectedSemesterId);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const refreshAssessments = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const statCards = [
    { label: "Total assessments", value: stats.total },
    { label: "Completion rate", value: `${stats.completionRate}%` },
    { label: "Upcoming", value: stats.upcomingDeadlines },
    { label: "Submitted", value: stats.submitted },
    { label: "In progress", value: stats.inProgress },
    { label: "Not started", value: stats.notStarted },
  ];

  return (
    <div className="min-h-safe-screen bg-background">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>
      <DashboardHeader onLogout={handleLogout} />
      <div className="p-4 md:p-6 pl-safe pr-safe pt-safe pb-safe">
        <div className="max-w-7xl mx-auto">
          <SemesterTabs
            semesters={semesters}
            setSemesters={setSemesters}
            activeSemester={activeSemester}
            isLoading={semestersLoading}
          />

          {showStatsBar && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6">
              {statCards.map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-card p-4 shadow-soft md:p-5">
                  <p className="text-xs font-medium text-muted-foreground">{label}</p>
                  <p className="mt-1 text-xl font-semibold text-foreground md:text-2xl">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="mt-6">
            <TabNavigationBar />

            {/* Tab Content Area */}
            <div className="mt-6">
              <div className="rounded-xl bg-card shadow-soft">
                {isLoading ? (
                  <div className="flex justify-center py-16">
                    <LoadingSpinner />
                  </div>
                ) : (
                  children({
                    selectedSemester,
                    selectedSemesterId,
                    assessments,
                    courses,
                    availableCourses,
                    error,
                    stats,
                    refreshAssessments,
                    refreshTrigger,
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
