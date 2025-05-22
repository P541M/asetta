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
          </div>
          <SemesterTabs
            selectedSemester={selectedSemester}
            onSelect={setSelectedSemester}
          />
          {selectedSemester ? (
            <>
              {showStatsBar && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                  <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-4 border border-gray-100 dark:border-dark-border hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                        Total Assessments
                      </p>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400 dark:text-dark-text-tertiary group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path
                          fillRule="evenodd"
                          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                      {stats.total}
                    </h3>
                  </div>

                  <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-4 border border-gray-100 dark:border-dark-border hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                        Not Started
                      </p>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400 dark:text-dark-text-tertiary group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                      {stats.notStarted}
                    </h3>
                  </div>

                  <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-4 border border-gray-100 dark:border-dark-border hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                        In Progress
                      </p>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400 dark:text-dark-text-tertiary group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                      {stats.inProgress}
                    </h3>
                  </div>

                  <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-4 border border-gray-100 dark:border-dark-border hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                        Submitted
                      </p>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400 dark:text-dark-text-tertiary group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                      {stats.submitted}
                    </h3>
                  </div>

                  <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-4 border border-gray-100 dark:border-dark-border hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                        Due This Week
                      </p>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400 dark:text-dark-text-tertiary group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex items-center">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                        {stats.upcomingDeadlines}
                      </h3>
                      {stats.upcomingDeadlines > 0 && (
                        <span className="ml-2 inline-block w-2 h-2 bg-amber-500 dark:bg-amber-400 rounded-full animate-pulse"></span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-4 border border-gray-100 dark:border-dark-border hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                        Completion Rate
                      </p>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400 dark:text-dark-text-tertiary group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                      {stats.completionRate}%
                    </h3>
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
                      Add Assessment
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {activeTab === "courses" && !selectedCourse && (
                    <div className="animate-fade-in">
                      {isLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
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
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
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
                      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm border border-gray-100 dark:border-dark-border-primary p-6">
                        <h2 className="text-xl font-medium mb-6 dark:text-dark-text-primary">
                          Add Assessment for {selectedSemester}
                        </h2>

                        <div className="flex space-x-4 mb-6">
                          <button
                            onClick={() => setAddMode("manual")}
                            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                              addMode === "manual"
                                ? "bg-primary-500 text-white shadow-md"
                                : "bg-gray-50 dark:bg-dark-bg-tertiary text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-hover"
                            }`}
                          >
                            <div className="flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Quick Add
                            </div>
                          </button>
                          <button
                            onClick={() => setAddMode("upload")}
                            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                              addMode === "upload"
                                ? "bg-primary-500 text-white shadow-md"
                                : "bg-gray-50 dark:bg-dark-bg-tertiary text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-hover"
                            }`}
                          >
                            <div className="flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2"
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
                            </div>
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
                  className="h-16 w-16 mx-auto text-primary-300 dark:text-primary-500"
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
