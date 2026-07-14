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
import { useSemesterSelection } from "../../hooks/useSemesterSelection";
import { useSemesterAssessments, DashboardStats } from "../../hooks/useSemesterAssessments";
import { useDisplayPreferences } from "../../hooks/useDisplayPreferences";

interface DashboardLayoutProps {
  children: (props: {
    selectedSemester: string;
    selectedSemesterId: string;
    assessments: Assessment[];
    courses: CourseStats[];
    availableCourses: string[];
    isLoading: boolean;
    isDataReady: boolean;
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

  const { selectedSemester, setSelectedSemester, selectedSemesterId } = useSemesterSelection(
    user,
    forceSemesterId,
  );
  const { assessments, courses, availableCourses, isLoading, isDataReady, error, stats } =
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

  return (
    <div className="min-h-safe-screen bg-light-bg-secondary dark:bg-dark-bg-primary transition-theme">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>
      <DashboardHeader onLogout={handleLogout} />
      <div className="p-4 md:p-6 pl-safe pr-safe pt-safe pb-safe">
        <div className="max-w-7xl mx-auto">
          <SemesterTabs
            selectedSemester={selectedSemester}
            onSelect={setSelectedSemester}
            className="bg-light-bg-primary dark:bg-dark-bg-secondary rounded-xl border border-light-border-primary dark:border-dark-border-primary"
          />

          {showStatsBar && (
            <div className="stats-bar mt-6">
              <div className="stat-card">
                <p className="stat-label">Total Assessments</p>
                <h3 className="stat-value">{stats.total}</h3>
              </div>
              <div className="stat-card">
                <p className="stat-label">Completion Rate</p>
                <h3 className="stat-value">{stats.completionRate}%</h3>
              </div>
              <div className="stat-card">
                <p className="stat-label">Upcoming</p>
                <h3 className="stat-value">{stats.upcomingDeadlines}</h3>
              </div>
              <div className="stat-card">
                <p className="stat-label">Submitted</p>
                <h3 className="stat-value">{stats.submitted}</h3>
              </div>
              <div className="stat-card">
                <p className="stat-label">In Progress</p>
                <h3 className="stat-value">{stats.inProgress}</h3>
              </div>
              <div className="stat-card">
                <p className="stat-label">Not Started</p>
                <h3 className="stat-value">{stats.notStarted}</h3>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="mt-8">
            <TabNavigationBar />

            {/* Tab Content Area */}
            <div className="mt-6">
              <div
                className={`bg-light-bg-primary dark:bg-dark-bg-secondary rounded-xl border border-light-border-primary dark:border-dark-border-primary ${
                  isDataReady ? "animate-fade-in-up" : "opacity-0"
                }`}
              >
                {children({
                  selectedSemester,
                  selectedSemesterId,
                  assessments,
                  courses,
                  availableCourses,
                  isLoading,
                  isDataReady,
                  error,
                  stats,
                  refreshAssessments,
                  refreshTrigger,
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
