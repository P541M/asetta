// src/components/CourseFilteredAssessments.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import AssessmentsTable from "./AssessmentsTable";
import GradeCalculator from "./GradeCalculator";
import { Assessment } from "../types/assessment";

interface CourseFilteredAssessmentsProps {
  semesterId: string;
  selectedCourse: string;
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
  const [showGradeCalculator, setShowGradeCalculator] = useState(false);

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
        >
          ← Back to All Courses
        </button>
        <button
          onClick={() => setShowGradeCalculator(!showGradeCalculator)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          {showGradeCalculator ? 'Hide Grade Calculator' : 'Show Grade Calculator'}
        </button>
      </div>

      {showGradeCalculator && (
        <GradeCalculator
          semesterId={semesterId}
          selectedCourse={selectedCourse}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400 animate-fade-in">
          <p>{error}</p>
        </div>
      ) : assessments.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-dark-text-tertiary animate-fade-in">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-dark-text-tertiary animate-bounce-light"
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
          <p className="text-lg font-medium mb-2 dark:text-dark-text-primary">No assessments found for this course</p>
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