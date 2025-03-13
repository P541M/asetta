// pages/dashboard.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/router";
import { db } from "../lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import SemesterTabs from "../components/SemesterTabs";
import UploadForm from "../components/UploadForm";
import AssessmentsTable from "../components/AssessmentsTable";
import AddAssessmentForm from "../components/AddAssessmentForm";
import Header from "../components/Header";

interface Assessment {
  id: string;
  courseName: string;
  assignmentName: string;
  dueDate: string;
  weight: number;
  status: string;
}

const Dashboard = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"assessments" | "add" | "upload">(
    "assessments"
  );

  // Stats for dashboard
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    upcomingDeadlines: 0,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Find semester ID when semester name changes
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

  // Listen for assessments when semester ID changes
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
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const assessmentsList: Assessment[] = [];
        snapshot.forEach((doc) => {
          assessmentsList.push({
            id: doc.id,
            ...(doc.data() as Omit<Assessment, "id">),
          });
        });
        setAssessments(assessmentsList);

        // Calculate stats
        const now = new Date();
        const oneWeek = new Date();
        oneWeek.setDate(now.getDate() + 7);

        const totalCount = assessmentsList.length;
        const completedCount = assessmentsList.filter(
          (a) => a.status === "Completed"
        ).length;
        const inProgressCount = assessmentsList.filter(
          (a) => a.status === "In progress"
        ).length;
        const notStartedCount = assessmentsList.filter(
          (a) => a.status === "Not started"
        ).length;
        const upcomingCount = assessmentsList.filter((a) => {
          const dueDate = new Date(a.dueDate);
          return (
            dueDate > now && dueDate <= oneWeek && a.status !== "Completed"
          );
        }).length;

        setStats({
          total: totalCount,
          completed: completedCount,
          inProgress: inProgressCount,
          notStarted: notStartedCount,
          upcomingDeadlines: upcomingCount,
        });

        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching assessments:", err);
        setError("Failed to load assessments. Please try again.");
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [selectedSemesterId, user]);

  const refreshAssessments = () => {
    // This function now serves as a placeholder since we're using real-time listeners
    console.log("Assessment data refreshed");
    setActiveTab("assessments");
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onLogout={handleLogout} />

      <div className="flex-grow p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Academic Dashboard
            </h1>
            <p className="text-gray-600">
              Organize and track your academic tasks efficiently
            </p>
          </div>

          <SemesterTabs
            selectedSemester={selectedSemester}
            onSelect={setSelectedSemester}
          />

          {selectedSemester ? (
            <>
              {/* Dashboard Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">
                    Total Assessments
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </h3>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Completed</p>
                  <h3 className="text-2xl font-bold text-emerald-600">
                    {stats.completed}
                  </h3>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">In Progress</p>
                  <h3 className="text-2xl font-bold text-blue-600">
                    {stats.inProgress}
                  </h3>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Not Started</p>
                  <h3 className="text-2xl font-bold text-gray-600">
                    {stats.notStarted}
                  </h3>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Due This Week</p>
                  <h3 className="text-2xl font-bold text-amber-600">
                    {stats.upcomingDeadlines}
                  </h3>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
                <div className="border-b border-gray-100">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab("assessments")}
                      className={`px-5 py-4 font-medium text-sm ${
                        activeTab === "assessments"
                          ? "text-indigo-700 border-b-2 border-indigo-500"
                          : "text-gray-600 hover:text-indigo-600"
                      }`}
                    >
                      Assessments
                    </button>
                    <button
                      onClick={() => setActiveTab("add")}
                      className={`px-5 py-4 font-medium text-sm ${
                        activeTab === "add"
                          ? "text-indigo-700 border-b-2 border-indigo-500"
                          : "text-gray-600 hover:text-indigo-600"
                      }`}
                    >
                      Add Manually
                    </button>
                    <button
                      onClick={() => setActiveTab("upload")}
                      className={`px-5 py-4 font-medium text-sm ${
                        activeTab === "upload"
                          ? "text-indigo-700 border-b-2 border-indigo-500"
                          : "text-gray-600 hover:text-indigo-600"
                      }`}
                    >
                      Upload Outline
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {activeTab === "assessments" && (
                    <div>
                      {isLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                      ) : error ? (
                        <div className="p-4 bg-red-50 rounded-lg text-red-700">
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

                  {activeTab === "add" && selectedSemesterId && (
                    <div>
                      <AddAssessmentForm
                        semester={selectedSemester}
                        semesterId={selectedSemesterId}
                        onSuccess={refreshAssessments}
                      />
                    </div>
                  )}

                  {activeTab === "upload" && (
                    <div>
                      <UploadForm
                        semester={selectedSemester}
                        onUploadSuccess={refreshAssessments}
                      />
                    </div>
                  )}
                </div>
              </div>

              {activeTab === "assessments" && assessments.length > 0 && (
                <div className="flex justify-end mb-10">
                  <button
                    onClick={() => setActiveTab("add")}
                    className="btn-primary flex items-center gap-2"
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
              <div className="mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-indigo-300"
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
              <h2 className="text-xl font-bold mb-2">Welcome to Kivo!</h2>
              <p className="text-gray-600 mb-6">
                Track your assignments, exams, and projects in one place.
              </p>
              <p className="text-gray-500 mb-6">
                Please add a semester to get started tracking your assessments.
              </p>
            </div>
          )}
        </div>
      </div>

      <footer className="bg-white border-t border-gray-100 py-4 text-center text-sm text-gray-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} Kivo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
