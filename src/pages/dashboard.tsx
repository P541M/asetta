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
  const [selectedSemester, setSelectedSemester] =
    useState<string>("Spring2025");
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Dummy function: Fetch assessments based on the selected semester.
  // The parameter 'semester' is now used to simulate different data.
  const fetchAssessments = async (semester: string) => {
    // Simulated fetched data (in a real app, fetch from Firestore)
    const dummyData: Assessment[] = [
      {
        courseName: "CS101",
        assignmentName: "Assignment 1",
        dueDate: "2025-03-01",
        weight: 10,
        status: "Not started",
      },
      {
        courseName: "CS101",
        assignmentName: "Project",
        dueDate: "2025-04-15",
        weight: 20,
        status: "Not started",
      },
    ];
    // Here we simulate that different semesters could yield different data.
    if (semester === "Spring2025") {
      setAssessments(dummyData);
    } else {
      setAssessments([]);
    }
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

      <div className="mt-6">
        <UploadForm
          semester={selectedSemester}
          onUploadSuccess={fetchAssessments}
        />
      </div>

      <div className="mt-6">
        <AssessmentsTable assessments={assessments} />
      </div>
    </div>
  );
};

export default Dashboard;
