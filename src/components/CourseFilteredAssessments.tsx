// src/components/CourseFilteredAssessments.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import AssessmentsTable from "./AssessmentsTable";

interface Assessment {
  id: string;
  courseName: string;
  assignmentName: string;
  dueDate: string;
  weight: number;
  status: string;
}

interface CourseFilteredAssessmentsProps {
  semesterId: string;
  selectedCourse: string | null;
  onBack: () => void;
}

const CourseFilteredAssessments = ({
  semesterId,
  selectedCourse,
  onBack,
}: CourseFilteredAssessmentsProps) => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      if (!user || !semesterId || !selectedCourse) {
        setAssessments([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const assessmentsRef = collection(
          db,
          "users",
          user.uid,
          "semesters",
          semesterId,
          "assessments"
        );
        
        // Query for the specific course
        const q = query(
          assessmentsRef,
          where("courseName", "==", selectedCourse)
        );
        
        const querySnapshot = await getDocs(q);
        const assessmentsList: Assessment[] = [];
        
        querySnapshot.forEach((doc) => {
          assessmentsList.push({
            id: doc.id,
            ...(doc.data() as Omit<Assessment, "id">),
          });
        });
        
        setAssessments(assessmentsList);
      } catch (err) {
        console.error("Error fetching course assessments:", err);
        setError("Failed to load assessments for this course.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessments();
  }, [user, semesterId, selectedCourse]);

  const handleStatusChange = () => {
    // Refetch assessments when status changes
    const fetchAssessments = async () => {
      if (!user || !semesterId || !selectedCourse) return;

      try {
        const assessmentsRef = collection(
          db,
          "users",
          user.uid,
          "semesters",
          semesterId,
          "assessments"
        );
        
        const q = query(
          assessmentsRef,
          where("courseName", "==", selectedCourse)
        );
        
        const querySnapshot = await getDocs(q);
        const assessmentsList: Assessment[] = [];
        
        querySnapshot.forEach((doc) => {
          assessmentsList.push({
            id: doc.id,
            ...(doc.data() as Omit<Assessment, "id">),
          });
        });
        
        setAssessments(assessmentsList);
      } catch (err) {
        console.error("Error refreshing course assessments:", err);
      }
    };

    fetchAssessments();
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-3 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
          title="Back to all courses"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <h2 className="text-xl font-medium text-gray-900">
          {selectedCourse ? `Assessments for ${selectedCourse}` : "Course Assessments"}
        </h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 rounded-lg text-red-700 animate-fade-in">
          <p>{error}</p>
        </div>
      ) : assessments.length === 0 ? (
        <div className="text-center py-10 text-gray-500 animate-fade-in">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-4 text-gray-300 animate-bounce-light"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg font-medium mb-2">No assessments found for this course</p>
          <p>
            This course doesn't have any assessments yet. Add assessments manually or upload a course outline.
          </p>
        </div>
      ) : (
        <AssessmentsTable
          assessments={assessments}
          semesterId={semesterId}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default CourseFilteredAssessments;