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
  doc,
} from "firebase/firestore";
import SemesterTabs from "../components/SemesterTabs";
import UploadForm from "../components/UploadForm";
import AssessmentsTable from "../components/AssessmentsTable";
import AddAssessmentForm from "../components/AddAssessmentForm";

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
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-primary-700">
              CATT - Course Assessment Tracker
            </h1>
            <button
              onClick={handleLogout}
              className="btn-outline flex items-center gap-2"
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
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Logout
            </button>
          </div>

          <SemesterTabs
            selectedSemester={selectedSemester}
            onSelect={setSelectedSemester}
          />
        </header>

        {selectedSemester ? (
          <>
            <div className="card mb-6">
              <div className="border-b border-secondary-100 pb-4 mb-4">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setActiveTab("assessments")}
                    className={`px-4 py-2 rounded-t-lg font-medium ${
                      activeTab === "assessments"
                        ? "bg-primary-50 text-primary-700 border-b-2 border-primary-500"
                        : "text-secondary-600 hover:text-primary-600"
                    }`}
                  >
                    Assessments
                  </button>
                  <button
                    onClick={() => setActiveTab("add")}
                    className={`px-4 py-2 rounded-t-lg font-medium ${
                      activeTab === "add"
                        ? "bg-primary-50 text-primary-700 border-b-2 border-primary-500"
                        : "text-secondary-600 hover:text-primary-600"
                    }`}
                  >
                    Add Manually
                  </button>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className={`px-4 py-2 rounded-t-lg font-medium ${
                      activeTab === "upload"
                        ? "bg-primary-50 text-primary-700 border-b-2 border-primary-500"
                        : "text-secondary-600 hover:text-primary-600"
                    }`}
                  >
                    Upload Outline
                  </button>
                </div>
              </div>

              {activeTab === "assessments" && (
                <div>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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

            {activeTab === "assessments" && assessments.length > 0 && (
              <div className="flex justify-end space-x-4 mb-10">
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
          <div className="card text-center p-10">
            <div className="mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-primary-300"
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
            <h2 className="text-xl font-bold mb-2">Welcome to CATT!</h2>
            <p className="text-secondary-600 mb-6">
              Track your assignments, exams, and projects in one place.
            </p>
            <p className="text-secondary-500 mb-6">
              Please add a semester to get started tracking your assessments.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
