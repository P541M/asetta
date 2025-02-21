// pages/dashboard.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/router";
import SemesterTabs from "../components/SemesterTabs";
import UploadForm from "../components/UploadForm";
import AssessmentsTable from "../components/AssessmentsTable";

interface Assessment {
  courseName: string;
  assignmentName: string;
  dueDate: string;
  weight: number;
  status: string;
}

const Dashboard = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [selectedSemester, setSelectedSemester] = useState<string>(""); // default is now empty
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Updated: No pre-added dummy data; start with an empty slate.
  const fetchAssessments = async (semester: string) => {
    // In a real implementation, fetch assessments for the semester from your database.
    // For now, ensure it resets to an empty array.
    setAssessments([]);
  };

  useEffect(() => {
    if (selectedSemester) {
      fetchAssessments(selectedSemester);
    }
  }, [selectedSemester]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assessment Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
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
          <div className="mt-6">
            <UploadForm
              semester={selectedSemester}
              onUploadSuccess={fetchAssessments}
            />
          </div>

          <div className="mt-6">
            <AssessmentsTable assessments={assessments} />
          </div>
        </>
      ) : (
        <p>Please add a semester to get started.</p>
      )}
    </div>
  );
};

export default Dashboard;
