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
    // But we can keep it around in case we need to trigger a refresh manually
    console.log("Assessment data refreshed");
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          CATT - Calendar Assessment Task Tracker
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </header>

      <SemesterTabs
        selectedSemester={selectedSemester}
        onSelect={setSelectedSemester}
      />

      {selectedSemester ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <UploadForm
                semester={selectedSemester}
                onUploadSuccess={refreshAssessments}
              />
            </div>

            {selectedSemesterId && (
              <div>
                <AddAssessmentForm
                  semester={selectedSemester}
                  semesterId={selectedSemesterId}
                  onSuccess={refreshAssessments}
                />
              </div>
            )}
          </div>

          <div className="mt-6">
            {isLoading ? (
              <div className="bg-white p-6 rounded shadow-md text-center">
                <p>Loading assessments...</p>
              </div>
            ) : error ? (
              <div className="bg-white p-6 rounded shadow-md">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <AssessmentsTable
                assessments={assessments}
                semesterId={selectedSemesterId}
                onStatusChange={refreshAssessments}
              />
            )}
          </div>
        </>
      ) : (
        <div className="bg-white p-6 rounded shadow-md text-center">
          <p className="text-lg">Welcome to CATT!</p>
          <p className="mt-2">
            Please add a semester to get started tracking your assessments.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
