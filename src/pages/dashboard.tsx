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
    "courses" | "assessments" | "add" | "upload" | "calendar"
  >("assessments");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [animateStatCards, setAnimateStatCards] = useState(false);
  const [showStatsBar, setShowStatsBar] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    planning: 0,
    active: 0,
    submission: 0,
    completed: 0,
    problem: 0,
    upcomingDeadlines: 0,
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
          const planningCount = assessmentsList.filter(
            (a) => a.status === "Not started" || a.status === "Draft"
          ).length;
          const activeCount = assessmentsList.filter(
            (a) =>
              a.status === "In progress" ||
              a.status === "On Hold" ||
              a.status === "Needs Revision"
          ).length;
          const submissionCount = assessmentsList.filter(
            (a) =>
              a.status === "Pending Submission" ||
              a.status === "Submitted" ||
              a.status === "Under Review"
          ).length;
          const completedCount = assessmentsList.filter(
            (a) => a.status === "Completed"
          ).length;
          const problemCount = assessmentsList.filter(
            (a) => a.status === "Missed/Late" || a.status === "Deferred"
          ).length;
          const upcomingCount = assessmentsList.filter((a) => {
            const dueDate = new Date(a.dueDate);
            return (
              dueDate > now && dueDate <= oneWeek && a.status !== "Completed"
            );
          }).length;
          setStats({
            total: totalCount,
            planning: planningCount,
            active: activeCount,
            submission: submissionCount,
            completed: completedCount,
            problem: problemCount,
            upcomingDeadlines: upcomingCount,
          });
          setAnimateStatCards(true);
          setTimeout(() => setAnimateStatCards(false), 1000);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">
                Dashboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mt-1">
                {selectedSemester
                  ? `Viewing ${selectedSemester} semester`
                  : "Select a semester to get started"}
              </p>
            </div>
            <div className="flex items-center mt-4 md:mt-0 space-x-3">
              {selectedSemester && (
                <>
                  <button
                    onClick={() => setActiveTab("add")}
                    className="btn-primary text-sm py-1.5 px-3 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add Assessment
                  </button>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="btn-outline text-sm py-1.5 px-3 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Upload Outline
                  </button>
                </>
              )}
            </div>
          </div>
          <SemesterTabs
            selectedSemester={selectedSemester}
            onSelect={setSelectedSemester}
          />
          {selectedSemester ? (
            <>
              {showStatsBar && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                  <div
                    className={`bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm p-4 border ${
                      animateStatCards
                        ? "border-indigo-500"
                        : "border-gray-100 dark:border-dark-border"
                    } transition-colors duration-300 stat-card`}
                  >
                    <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mb-1">
                      Total Assessments
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                      {stats.total}
                    </h3>
                  </div>
                  <div
                    className={`bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm p-4 border ${
                      animateStatCards
                        ? "border-indigo-500"
                        : "border-gray-100 dark:border-dark-border"
                    } transition-colors duration-300 stat-card`}
                  >
                    <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mb-1">
                      Planning
                    </p>
                    <h3 className="text-2xl font-bold text-gray-600 dark:text-dark-text-primary">
                      {stats.planning}
                    </h3>
                  </div>
                  <div
                    className={`bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm p-4 border ${
                      animateStatCards
                        ? "border-indigo-500"
                        : "border-gray-100 dark:border-dark-border"
                    } transition-colors duration-300 stat-card`}
                  >
                    <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mb-1">
                      Active Work
                    </p>
                    <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.active}
                    </h3>
                  </div>
                  <div
                    className={`bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm p-4 border ${
                      animateStatCards
                        ? "border-indigo-500"
                        : "border-gray-100 dark:border-dark-border"
                    } transition-colors duration-300 stat-card`}
                  >
                    <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mb-1">
                      Submission
                    </p>
                    <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {stats.submission}
                    </h3>
                  </div>
                  <div
                    className={`bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm p-4 border ${
                      animateStatCards
                        ? "border-indigo-500"
                        : "border-gray-100 dark:border-dark-border"
                    } transition-colors duration-300 stat-card`}
                  >
                    <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mb-1">
                      Completed
                    </p>
                    <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {stats.completed}
                    </h3>
                  </div>
                  <div
                    className={`bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm p-4 border ${
                      animateStatCards
                        ? "border-indigo-500"
                        : "border-gray-100 dark:border-dark-border"
                    } transition-colors duration-300 stat-card`}
                  >
                    <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mb-1">
                      Due This Week
                    </p>
                    <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {stats.upcomingDeadlines}
                    </h3>
                    {stats.upcomingDeadlines > 0 && (
                      <span className="inline-block w-2 h-2 bg-amber-500 dark:bg-amber-400 rounded-full animate-pulse mt-1"></span>
                    )}
                  </div>
                </div>
              )}
              {stats.problem > 0 && (
                <div className="mb-6">
                  <div
                    className={`bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm p-4 border ${
                      animateStatCards
                        ? "border-red-500"
                        : "border-red-100 dark:border-red-900/30"
                    } transition-colors duration-300 stat-card`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mb-1">
                          Attention Required
                        </p>
                        <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {stats.problem} assessment
                          {stats.problem > 1 ? "s" : ""}
                        </h3>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-dark-text-tertiary">
                        <p>Assessments marked as Missed/Late or Deferred</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm border border-gray-100 dark:border-dark-border mb-6 overflow-hidden transition-all duration-300 hover:shadow-md">
                <div className="border-b border-gray-100 dark:border-dark-border">
                  <div className="flex flex-wrap">
                    <button
                      onClick={() => {
                        setActiveTab("courses");
                        setSelectedCourse(null);
                      }}
                      className={`px-5 py-4 font-medium text-sm tab dark:text-dark-text-primary ${
                        activeTab === "courses" && !selectedCourse
                          ? "active"
                          : ""
                      }`}
                    >
                      Courses
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("assessments");
                        setSelectedCourse(null);
                      }}
                      className={`px-5 py-4 font-medium text-sm tab dark:text-dark-text-primary ${
                        activeTab === "assessments" && !selectedCourse
                          ? "active"
                          : ""
                      }`}
                    >
                      All Assessments
                    </button>
                    <button
                      onClick={() => setActiveTab("calendar")}
                      className={`px-5 py-4 font-medium text-sm tab dark:text-dark-text-primary ${
                        activeTab === "calendar" ? "active" : ""
                      }`}
                    >
                      Calendar
                    </button>
                    <button
                      onClick={() => setActiveTab("add")}
                      className={`px-5 py-4 font-medium text-sm tab dark:text-dark-text-primary ${
                        activeTab === "add" ? "active" : ""
                      }`}
                    >
                      Add Manually
                    </button>
                    <button
                      onClick={() => setActiveTab("upload")}
                      className={`px-5 py-4 font-medium text-sm tab dark:text-dark-text-primary ${
                        activeTab === "upload" ? "active" : ""
                      }`}
                    >
                      Upload Outline
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {activeTab === "courses" && !selectedCourse && (
                    <div className="animate-fade-in">
                      {isLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                      ) : error ? (
                        <div className="p-4 bg-red-50 rounded-lg text-red-700 animate-fade-in">
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
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                      ) : error ? (
                        <div className="p-4 bg-red-50 rounded-lg text-red-700 animate-fade-in">
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
                    <div className="animate-fade-in">
                      <AddAssessmentForm
                        semester={selectedSemester}
                        semesterId={selectedSemesterId}
                        onSuccess={refreshAssessments}
                      />
                    </div>
                  )}
                  {activeTab === "upload" && (
                    <div className="animate-fade-in">
                      <UploadForm
                        semester={selectedSemester}
                        onUploadSuccess={refreshAssessments}
                      />
                    </div>
                  )}
                </div>
              </div>
              {(activeTab === "assessments" ||
                activeTab === "courses" ||
                activeTab === "calendar") &&
                assessments.length > 0 && (
                  <div className="flex justify-end mb-10">
                    <button
                      onClick={() => setActiveTab("add")}
                      className="btn-primary flex items-center gap-2 shadow hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Add Assessment
                    </button>
                  </div>
                )}
            </>
          ) : (
            <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-10 text-center">
              <div className="mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-indigo-300 dark:text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 dark:text-dark-text-primary">
                Welcome to Asetta
              </h2>
              <p className="text-gray-600 dark:text-dark-text-secondary mb-4">
                Track your assignments, exams, and projects in one place.
              </p>
              <p className="text-gray-500 dark:text-dark-text-tertiary mb-6">
                Please add a semester to get started tracking your assessments.
              </p>
              <button
                onClick={() => {
                  const semesterTabsElement = document.querySelector(
                    ".semester-tabs-container"
                  );
                  if (semesterTabsElement) {
                    const addButton = semesterTabsElement.querySelector(
                      ".add-semester-button"
                    );
                    if (addButton) {
                      (addButton as HTMLElement).click();
                    }
                  }
                }}
                className="btn-primary flex items-center mx-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Semester
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
