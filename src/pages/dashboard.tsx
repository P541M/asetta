import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/router";
import Head from "next/head";
import { db } from "../lib/firebase";
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
import SemesterTabs from "../components/assessment/SemesterTabs";
import UploadForm from "../components/forms/UploadForm";
import AssessmentsTable from "../components/tables/AssessmentsTable";
import CoursesOverviewTable from "../components/tables/CoursesOverviewTable";
import CourseFilteredAssessments from "../components/assessment/CourseFilteredAssessments";
import AddAssessmentForm from "../components/forms/AddAssessmentForm";
import CalendarView from "../components/calendar/CalendarView";
import DashboardHeader from "../components/layout/DashboardHeader";

interface Assessment {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  notes?: string;
  courseName: string;
  assignmentName: string;
  dueTime: string;
  weight: number;
}

const Dashboard = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "courses" | "assessments" | "add" | "calendar"
  >("assessments");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showStatsBar, setShowStatsBar] = useState(false);
  const [addMode, setAddMode] = useState<"manual" | "upload">("manual");

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

  useEffect(() => {
    const handleSwitchToAssessments = () => {
      setActiveTab("assessments");
    };

    window.addEventListener("switchToAssessments", handleSwitchToAssessments);
    return () => {
      window.removeEventListener(
        "switchToAssessments",
        handleSwitchToAssessments
      );
    };
  }, []);

  const refreshAssessments = () => {
    console.log("Assessment data refreshed");
  };

  const handleSelectCourse = (courseName: string) => {
    setSelectedCourse(courseName);
    setActiveTab("assessments");
  };

  const handleClearCourseSelection = () => {
    setSelectedCourse(null);
    setActiveTab("courses");
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center animate-pulse">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary">
      <Head>
        <title>Asetta - Your Academic Dashboard</title>
        <meta
          name="description"
          content="Manage your semesters, track assessments, and stay organized with Asetta."
        />
      </Head>
      <DashboardHeader onLogout={handleLogout} />
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-dark-text-primary">
                Dashboard
              </h1>
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
            className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-md border border-gray-100 dark:border-dark-border-primary"
          />

          {showStatsBar && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8 mt-6">
              <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                    Total Assessments
                  </p>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                  {stats.total}
                </h3>
              </div>
              <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                    Not Started
                  </p>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                  {stats.notStarted}
                </h3>
              </div>
              <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                    In Progress
                  </p>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                  {stats.inProgress}
                </h3>
              </div>
              <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                    Submitted
                  </p>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                  {stats.submitted}
                </h3>
              </div>
              <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                    Upcoming
                  </p>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                  {stats.upcomingDeadlines}
                </h3>
              </div>
              <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
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
            <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-1 shadow-md">
              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-2">
                <button
                  onClick={() => {
                    setActiveTab("courses");
                    setSelectedCourse(null);
                  }}
                  className={`flex-1 px-6 py-3 font-medium text-sm transition-all duration-200 rounded-xl ${
                    activeTab === "courses" && !selectedCourse
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
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    <span>Courses</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("assessments");
                    setSelectedCourse(null);
                  }}
                  className={`flex-1 px-6 py-3 font-medium text-sm transition-all duration-200 rounded-xl ${
                    activeTab === "assessments" && !selectedCourse
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
                  onClick={() => setActiveTab("calendar")}
                  className={`flex-1 px-6 py-3 font-medium text-sm transition-all duration-200 rounded-xl ${
                    activeTab === "calendar"
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
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6zm2 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm4 2a1 1 0 100-2H6a1 1 0 100 2h6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Calendar</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("add")}
                  className={`flex-1 px-6 py-3 font-medium text-sm transition-all duration-200 rounded-xl ${
                    activeTab === "add"
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
              <div className="md:hidden grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setActiveTab("courses");
                    setSelectedCourse(null);
                  }}
                  className={`px-4 py-3 font-medium text-sm transition-all duration-200 rounded-xl ${
                    activeTab === "courses" && !selectedCourse
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
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    <span>Courses</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("assessments");
                    setSelectedCourse(null);
                  }}
                  className={`px-4 py-3 font-medium text-sm transition-all duration-200 rounded-xl ${
                    activeTab === "assessments" && !selectedCourse
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
                    <span>Assessments</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("calendar")}
                  className={`px-4 py-3 font-medium text-sm transition-all duration-200 rounded-xl ${
                    activeTab === "calendar"
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
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6zm2 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm4 2a1 1 0 100-2H6a1 1 0 100 2h6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Calendar</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("add")}
                  className={`px-4 py-3 font-medium text-sm transition-all duration-200 rounded-xl ${
                    activeTab === "add"
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
                    <span>Add</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-6">
              <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-md border border-gray-100 dark:border-dark-border-primary">
                {activeTab === "courses" && !selectedCourse && (
                  <div className="animate-fade-in">
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
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
                {activeTab === "assessments" && selectedCourse && (
                  <div className="animate-fade-in">
                    <CourseFilteredAssessments
                      semesterId={selectedSemesterId}
                      selectedCourse={selectedCourse}
                      onBack={handleClearCourseSelection}
                    />
                  </div>
                )}
                {activeTab === "assessments" && !selectedCourse && (
                  <div className="animate-fade-in">
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
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
                  </div>
                )}
                {activeTab === "calendar" && (
                  <div className="animate-fade-in">
                    <CalendarView
                      selectedSemester={selectedSemester}
                      semesterId={selectedSemesterId}
                    />
                  </div>
                )}
                {activeTab === "add" && selectedSemesterId && (
                  <div className="animate-fade-in p-6">
                    <h2 className="text-xl font-medium mb-6 dark:text-dark-text-primary">
                      Add Assessment for {selectedSemester}
                    </h2>

                    <div className="flex space-x-4 mb-6">
                      <button
                        onClick={() => setAddMode("manual")}
                        className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                          addMode === "manual"
                            ? "bg-primary-500 text-white shadow-sm"
                            : "bg-gray-50 dark:bg-dark-bg-tertiary text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-hover"
                        }`}
                      >
                        Quick Add
                      </button>
                      <button
                        onClick={() => setAddMode("upload")}
                        className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                          addMode === "upload"
                            ? "bg-primary-500 text-white shadow-sm"
                            : "bg-gray-50 dark:bg-dark-bg-tertiary text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-hover"
                        }`}
                      >
                        Upload File
                      </button>
                    </div>

                    {addMode === "manual" ? (
                      <AddAssessmentForm
                        semester={selectedSemester}
                        semesterId={selectedSemesterId}
                        onSuccess={refreshAssessments}
                      />
                    ) : (
                      <UploadForm
                        semester={selectedSemester}
                        onUploadSuccess={refreshAssessments}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
