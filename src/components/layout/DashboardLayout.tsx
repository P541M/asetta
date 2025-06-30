import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/router";
import Head from "next/head";
import { db } from "../../lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import SemesterTabs from "../assessment/SemesterTabs";
import DashboardHeader from "./DashboardHeader";
import { Assessment } from "../../types/assessment";

interface DashboardLayoutProps {
  children: (props: {
    selectedSemester: string;
    selectedSemesterId: string;
    assessments: Assessment[];
    isLoading: boolean;
    error: string | null;
    stats: {
      total: number;
      notStarted: number;
      inProgress: number;
      submitted: number;
      upcomingDeadlines: number;
      completionRate: number;
    };
    refreshAssessments: () => void;
  }) => React.ReactNode;
  title?: string;
  description?: string;
}

const DashboardLayout = ({
  children,
  title = "Asetta - Your Academic Dashboard",
  description = "Manage your semesters, track assessments, and stay organized with Asetta.",
}: DashboardLayoutProps) => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStatsBar, setShowStatsBar] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    notStarted: 0,
    inProgress: 0,
    submitted: 0,
    upcomingDeadlines: 0,
    completionRate: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const findSemesterId = async () => {
      if (!user || !selectedSemester) {
        setSelectedSemesterId("");
        return;
      }
      try {
        const semestersRef = collection(db, "users", user.uid, "semesters");
        const q = query(semestersRef, where("name", "==", selectedSemester));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setSelectedSemesterId(querySnapshot.docs[0].id);
        } else {
          setSelectedSemesterId("");
        }
      } catch (err) {
        console.error("Error finding semester ID:", err);
        setSelectedSemesterId("");
      }
    };
    findSemesterId();
  }, [selectedSemester, user]);

  useEffect(() => {
    if (!user || !selectedSemesterId) {
      setAssessments([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    const assessmentsRef = collection(
      db,
      "users",
      user.uid,
      "semesters",
      selectedSemesterId,
      "assessments"
    );
    const q = query(assessmentsRef, orderBy("dueDate", "asc"));
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const assessmentsList: Assessment[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            const today = new Date().toISOString().split("T")[0];
            return {
              id: doc.id,
              title: data.assignmentName || "Unknown Assessment",
              dueDate: data.dueDate || today,
              status: data.status || "Not started",
              notes: data.notes || "",
              courseName: data.courseName || "Unknown Course",
              assignmentName: data.assignmentName || "Unknown Assessment",
              dueTime: data.dueTime || "23:59",
              weight: data.weight || 0,
            };
          });
          setAssessments(assessmentsList);

          const now = new Date();
          const oneWeek = new Date();
          oneWeek.setDate(now.getDate() + 7);
          const totalCount = assessmentsList.length;
          const notStartedCount = assessmentsList.filter(
            (a) => a.status === "Not started"
          ).length;
          const inProgressCount = assessmentsList.filter(
            (a) => a.status === "In progress"
          ).length;
          const submittedCount = assessmentsList.filter(
            (a) => a.status === "Submitted"
          ).length;
          const upcomingCount = assessmentsList.filter((a) => {
            const dueDate = new Date(a.dueDate);
            return (
              dueDate > now && dueDate <= oneWeek && a.status !== "Submitted"
            );
          }).length;
          const completionRate =
            totalCount > 0
              ? Math.round((submittedCount / totalCount) * 100)
              : 0;
          setStats({
            total: totalCount,
            notStarted: notStartedCount,
            inProgress: inProgressCount,
            submitted: submittedCount,
            upcomingDeadlines: upcomingCount,
            completionRate: completionRate,
          });
          setIsLoading(false);
        },
        (err) => {
          console.error("Error fetching assessments:", err);
          setError("Failed to load assessments. Please try again.");
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error("Error setting up assessments listener:", error);
      setError("Failed to set up assessments listener. Please try again.");
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedSemesterId, user]);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return;
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setShowStatsBar(userData.showStatsBar ?? false);
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
      }
    };

    fetchUserPreferences();

    const handlePreferencesUpdate = (event: CustomEvent) => {
      if (event.detail) {
        if ("showStatsBar" in event.detail) {
          setShowStatsBar(event.detail.showStatsBar);
        }
      }
    };

    window.addEventListener(
      "userPreferencesUpdated",
      handlePreferencesUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        "userPreferencesUpdated",
        handlePreferencesUpdate as EventListener
      );
    };
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const refreshAssessments = () => {
    console.log("Assessment data refreshed");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg-primary">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-dark-text-secondary">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>
      <DashboardHeader onLogout={handleLogout} />
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-primary-600">Dashboard</h2>
              <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mt-1">
                {selectedSemester
                  ? `Viewing ${selectedSemester} semester`
                  : "Select a semester to get started"}
              </p>
            </div>
          </div>

          <SemesterTabs
            selectedSemester={selectedSemester}
            onSelect={setSelectedSemester}
            className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md"
          />

          {showStatsBar && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8 mt-6">
              <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-4 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                    Total Assessments
                  </p>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                  {stats.total}
                </h3>
              </div>
              <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-4 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                    Not Started
                  </p>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                  {stats.notStarted}
                </h3>
              </div>
              <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-4 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                    In Progress
                  </p>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                  {stats.inProgress}
                </h3>
              </div>
              <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-4 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                    Submitted
                  </p>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                  {stats.submitted}
                </h3>
              </div>
              <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-4 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                    Upcoming
                  </p>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                  {stats.upcomingDeadlines}
                </h3>
              </div>
              <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-4 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                    Completion Rate
                  </p>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                  {stats.completionRate}%
                </h3>
              </div>
            </div>
          )}

          <div className="mt-8">
            <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-1 shadow-md">
              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-2">
                <button
                  onClick={() => router.push("/dashboard/courses")}
                  className={`flex-1 px-6 py-3 font-medium text-sm transition-all duration-200 rounded-lg ${
                    router.pathname === "/dashboard/courses"
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm"
                      : "text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                    <span>Courses</span>
                  </div>
                </button>
                <button
                  onClick={() => router.push("/dashboard/assessments")}
                  className={`flex-1 px-6 py-3 font-medium text-sm transition-all duration-200 rounded-lg ${
                    router.pathname === "/dashboard/assessments"
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm"
                      : "text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>All Assessments</span>
                  </div>
                </button>
                <button
                  onClick={() => router.push("/dashboard/grades")}
                  className={`flex-1 px-6 py-3 font-medium text-sm transition-all duration-200 rounded-lg ${
                    router.pathname === "/dashboard/grades"
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm"
                      : "text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                    <span>Grades</span>
                  </div>
                </button>
                <button
                  onClick={() => router.push("/dashboard/calendar")}
                  className={`flex-1 px-6 py-3 font-medium text-sm transition-all duration-200 rounded-lg ${
                    router.pathname === "/dashboard/calendar"
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm"
                      : "text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>Calendar</span>
                  </div>
                </button>
                <button
                  onClick={() => router.push("/dashboard/add")}
                  className={`flex-1 px-6 py-3 font-medium text-sm transition-all duration-200 rounded-lg ${
                    router.pathname === "/dashboard/add"
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm"
                      : "text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Add Assessment</span>
                  </div>
                </button>
              </div>

              {/* Mobile Navigation */}
              <div className="md:hidden">
                <div className="grid grid-cols-3 gap-1 mb-1">
                <button
                  onClick={() => router.push("/dashboard/courses")}
                  className={`px-3 py-3 font-medium text-sm transition-all duration-200 rounded-lg ${
                    router.pathname === "/dashboard/courses"
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm"
                      : "text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                    <span className="text-xs">Courses</span>
                  </div>
                </button>
                <button
                  onClick={() => router.push("/dashboard/assessments")}
                  className={`px-3 py-3 font-medium text-sm transition-all duration-200 rounded-lg ${
                    router.pathname === "/dashboard/assessments"
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm"
                      : "text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs">Assessments</span>
                  </div>
                </button>
                <button
                  onClick={() => router.push("/dashboard/grades")}
                  className={`px-3 py-3 font-medium text-sm transition-all duration-200 rounded-lg ${
                    router.pathname === "/dashboard/grades"
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm"
                      : "text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                    <span className="text-xs">Grades</span>
                  </div>
                </button>
                </div>
                <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => router.push("/dashboard/calendar")}
                  className={`px-3 py-3 font-medium text-sm transition-all duration-200 rounded-lg ${
                    router.pathname === "/dashboard/calendar"
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm"
                      : "text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span className="text-xs">Calendar</span>
                  </div>
                </button>
                <button
                  onClick={() => router.push("/dashboard/add")}
                  className={`px-3 py-3 font-medium text-sm transition-all duration-200 rounded-lg ${
                    router.pathname === "/dashboard/add"
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm"
                      : "text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs">Add</span>
                  </div>
                </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md">
                {children({
                  selectedSemester,
                  selectedSemesterId,
                  assessments,
                  isLoading,
                  error,
                  stats,
                  refreshAssessments,
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