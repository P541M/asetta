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
import TabNavigationBar from "./TabNavigationBar";
import { Assessment } from "../../types/assessment";
import { CourseStats } from "../../types/course";

interface OptimizedDashboardLayoutProps {
  children: (props: {
    selectedSemester: string;
    selectedSemesterId: string;
    assessments: Assessment[];
    courses: CourseStats[];
    availableCourses: string[];
    isLoading: boolean;
    isDataReady: boolean;
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
  forceSemesterId?: string;
}

const OptimizedDashboardLayout = ({
  children,
  title = "Asetta - Your Academic Dashboard",
  description = "Manage your semesters, track assessments, and stay organized with Asetta.",
  forceSemesterId,
}: OptimizedDashboardLayoutProps) => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [courses, setCourses] = useState<CourseStats[]>([]);
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
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

  // Helper function to process course statistics from assessments
  const processCourseStats = (assessmentsList: Assessment[]): CourseStats[] => {
    const courseMap = new Map<string, Assessment[]>();
    assessmentsList.forEach((assessment) => {
      if (!courseMap.has(assessment.courseName)) {
        courseMap.set(assessment.courseName, []);
      }
      courseMap.get(assessment.courseName)?.push(assessment);
    });

    const courseStatsList: CourseStats[] = [];
    courseMap.forEach((assessments, courseName) => {
      const completedStatuses = ["Submitted"];
      const completed = assessments.filter((a) =>
        completedStatuses.includes(a.status)
      );
      const now = new Date();
      const upcomingAssessments = assessments
        .filter(
          (a) =>
            !completedStatuses.includes(a.status) &&
            new Date(a.dueDate) >= now
        )
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

      const nextUpcoming = upcomingAssessments[0];
      const progress = assessments.length > 0 
        ? Math.round((completed.length / assessments.length) * 100) 
        : 0;

      courseStatsList.push({
        courseName,
        totalAssessments: assessments.length,
        pendingAssessments: assessments.length - completed.length,
        completedAssessments: completed.length,
        nextDueDate: nextUpcoming ? nextUpcoming.dueDate : null,
        nextAssignment: nextUpcoming ? nextUpcoming.assignmentName : null,
        progress,
      });
    });

    return courseStatsList.sort((a, b) => a.courseName.localeCompare(b.courseName));
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const findSemesterId = async () => {
      if (!user) {
        setSelectedSemesterId("");
        setSelectedSemester("");
        return;
      }

      // If forceSemesterId is provided, use it directly
      if (forceSemesterId) {
        try {
          const semesterRef = doc(
            db,
            "users",
            user.uid,
            "semesters",
            forceSemesterId
          );
          const semesterSnap = await getDoc(semesterRef);
          if (semesterSnap.exists()) {
            setSelectedSemesterId(forceSemesterId);
            setSelectedSemester(semesterSnap.data().name);
          } else {
            setSelectedSemesterId("");
            setSelectedSemester("");
          }
        } catch (err) {
          console.error("Error finding forced semester:", err);
          setSelectedSemesterId("");
          setSelectedSemester("");
        }
        return;
      }

      // Original logic for when no forceSemesterId is provided
      if (!selectedSemester) {
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
  }, [selectedSemester, user, forceSemesterId]);

  useEffect(() => {
    if (!user || !selectedSemesterId) {
      setAssessments([]);
      return;
    }

    // Only show loading spinner on initial load or when there's no previous data
    if (assessments.length === 0) {
      setIsLoading(true);
    }
    setIsDataReady(false);
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

          // Process course statistics
          const courseStats = processCourseStats(assessmentsList);
          setCourses(courseStats);

          // Extract available courses (sorted alphabetically)
          const uniqueCourses = Array.from(
            new Set(assessmentsList.map(a => a.courseName))
          ).sort();
          setAvailableCourses(uniqueCourses);

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
          
          // Add a small delay before marking data as ready to ensure smooth animations
          setTimeout(() => {
            setIsDataReady(true);
          }, 50);
        },
        (err) => {
          console.error("Error fetching assessments:", err);
          setError("Failed to load assessments. Please try again.");
          setIsLoading(false);
          setIsDataReady(true);
        }
      );
    } catch (error) {
      console.error("Error setting up assessments listener:", error);
      setError("Failed to set up assessments listener. Please try again.");
      setIsLoading(false);
      setIsDataReady(true);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedSemesterId, user, assessments.length]);

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
      <div className="min-h-screen flex items-center justify-center bg-light-bg-secondary dark:bg-dark-bg-primary">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-light-button-primary border-t-transparent dark:border-dark-button-primary dark:border-t-transparent"></div>
          <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-safe-screen bg-light-bg-secondary dark:bg-dark-bg-primary transition-theme pt-safe pb-safe">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>
      <DashboardHeader onLogout={handleLogout} />
      <div className="p-4 md:p-6 pl-safe pr-safe">
        <div className="max-w-7xl mx-auto">
          {/* Persistent Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-light-button-primary dark:text-dark-button-primary">
                Dashboard
              </h1>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-2">
                {selectedSemester
                  ? `Viewing ${selectedSemester} semester`
                  : "Select a semester to get started"}
              </p>
            </div>
          </div>

          {/* Persistent Semester Tabs */}
          <SemesterTabs
            selectedSemester={selectedSemester}
            onSelect={setSelectedSemester}
            className="bg-light-bg-primary dark:bg-dark-bg-secondary rounded-xl border border-light-border-primary dark:border-dark-border-primary"
          />

          {/* Persistent Stats Bar */}
          {showStatsBar && (
            <div className="stats-bar mt-6">
              <div className="stat-card">
                <p className="stat-label">Total Assessments</p>
                <h3 className="stat-value">{stats.total}</h3>
              </div>
              <div className="stat-card">
                <p className="stat-label">Not Started</p>
                <h3 className="stat-value">{stats.notStarted}</h3>
              </div>
              <div className="stat-card">
                <p className="stat-label">In Progress</p>
                <h3 className="stat-value">{stats.inProgress}</h3>
              </div>
              <div className="stat-card">
                <p className="stat-label">Submitted</p>
                <h3 className="stat-value">{stats.submitted}</h3>
              </div>
              <div className="stat-card">
                <p className="stat-label">Upcoming</p>
                <h3 className="stat-value">{stats.upcomingDeadlines}</h3>
              </div>
              <div className="stat-card">
                <p className="stat-label">Completion Rate</p>
                <h3 className="stat-value">{stats.completionRate}%</h3>
              </div>
            </div>
          )}

          {/* Persistent Tab Navigation */}
          <div className="mt-8">
            <TabNavigationBar />

            {/* Tab Content Area */}
            <div className="mt-6">
              <div className="bg-light-bg-primary dark:bg-dark-bg-secondary rounded-xl border border-light-border-primary dark:border-dark-border-primary">
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
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizedDashboardLayout;