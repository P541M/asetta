import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Assessment } from "../types/assessment";

interface GradeCalculatorProps {
  semesterId: string;
  selectedCourse: string;
}

const GradeCalculator: React.FC<GradeCalculatorProps> = ({
  semesterId,
  selectedCourse,
}) => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentGrade, setCurrentGrade] = useState<number | null>(null);
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

        // Sort assessments by due date
        const sortedAssessments = assessmentsList.sort((a, b) => {
          const dateA = new Date(`${a.dueDate}T${a.dueTime}`);
          const dateB = new Date(`${b.dueDate}T${b.dueTime}`);
          return dateA.getTime() - dateB.getTime();
        });

        setAssessments(sortedAssessments);

        // Calculate total weight of all assessments
        const total = sortedAssessments.reduce(
          (sum, assessment) => sum + assessment.weight,
          0
        );
        setTotalWeight(total);

        // Calculate current grade based on completed assessments
        const completedAssessments = sortedAssessments.filter(
          (a) =>
            a.status === "Submitted" && a.mark !== null && a.mark !== undefined
        );
        if (completedAssessments.length > 0) {
          const weightedSum = completedAssessments.reduce((sum, assessment) => {
            if (assessment.mark === null || assessment.mark === undefined)
              return sum;
            return sum + (assessment.mark * assessment.weight) / 100;
          }, 0);
          const completedWeight = completedAssessments.reduce(
            (sum, assessment) => {
              if (assessment.mark === null || assessment.mark === undefined)
                return sum;
              return sum + assessment.weight;
            },
            0
          );
          setCurrentGrade(
            completedWeight > 0 ? (weightedSum / completedWeight) * 100 : 0
          );
        } else {
          setCurrentGrade(null);
        }
      } catch (err) {
        console.error("Error fetching course assessments:", err);
        setError("Failed to load assessments for this course.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessments();
  }, [user, semesterId, selectedCourse]);

  const handleMarkChange = (assessmentId: string, value: string) => {
    // Allow empty string to clear the mark, use null instead of undefined
    const mark = value === "" ? null : Math.max(0, parseFloat(value) || 0);

    // Update local state only
    setAssessments((prevAssessments) =>
      prevAssessments.map((assessment) =>
        assessment.id === assessmentId
          ? { ...assessment, mark, status: "Submitted" }
          : assessment
      )
    );

    // Recalculate current grade
    const updatedAssessments = assessments.map((assessment) =>
      assessment.id === assessmentId
        ? { ...assessment, mark, status: "Submitted" }
        : assessment
    );
    const completedAssessments = updatedAssessments.filter(
      (a) => a.status === "Submitted" && a.mark !== null && a.mark !== undefined
    );
    if (completedAssessments.length > 0) {
      const weightedSum = completedAssessments.reduce((sum, assessment) => {
        if (assessment.mark === null || assessment.mark === undefined)
          return sum;
        return sum + (assessment.mark * assessment.weight) / 100;
      }, 0);
      const completedWeight = completedAssessments.reduce((sum, assessment) => {
        if (assessment.mark === null || assessment.mark === undefined)
          return sum;
        return sum + assessment.weight;
      }, 0);
      setCurrentGrade(
        completedWeight > 0 ? (weightedSum / completedWeight) * 100 : 0
      );
    } else {
      setCurrentGrade(null);
    }

    setHasUnsavedChanges(true);
  };

  const handleWeightChange = (assessmentId: string, value: string) => {
    // Allow empty string to set weight to 0, but cap at 100
    const newWeight =
      value === "" ? 0 : Math.min(100, Math.max(0, parseFloat(value) || 0));

    // Update local state only
    setAssessments((prevAssessments) =>
      prevAssessments.map((assessment) =>
        assessment.id === assessmentId
          ? { ...assessment, weight: newWeight }
          : assessment
      )
    );

    // Recalculate total weight
    const updatedAssessments = assessments.map((assessment) =>
      assessment.id === assessmentId
        ? { ...assessment, weight: newWeight }
        : assessment
    );
    const total = updatedAssessments.reduce(
      (sum, assessment) => sum + assessment.weight,
      0
    );
    setTotalWeight(total);

    // Recalculate current grade
    const completedAssessments = updatedAssessments.filter(
      (a) => a.status === "Submitted" && a.mark !== null && a.mark !== undefined
    );
    if (completedAssessments.length > 0) {
      const weightedSum = completedAssessments.reduce((sum, assessment) => {
        if (assessment.mark === null || assessment.mark === undefined)
          return sum;
        return sum + (assessment.mark * assessment.weight) / 100;
      }, 0);
      const completedWeight = completedAssessments.reduce((sum, assessment) => {
        if (assessment.mark === null || assessment.mark === undefined)
          return sum;
        return sum + assessment.weight;
      }, 0);
      setCurrentGrade(
        completedWeight > 0 ? (weightedSum / completedWeight) * 100 : 0
      );
    }

    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!user || !semesterId || !hasUnsavedChanges) return;

    setIsLoading(true);
    setError(null);

    try {
      // Update all assessments in Firestore
      for (const assessment of assessments) {
        const assessmentRef = doc(
          db,
          "users",
          user.uid,
          "semesters",
          semesterId,
          "assessments",
          assessment.id
        );

        // Convert undefined mark to null for Firestore
        const mark = assessment.mark === undefined ? null : assessment.mark;

        await updateDoc(assessmentRef, {
          mark,
          weight: assessment.weight,
          status: assessment.status,
        });
      }

      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Error saving assessment changes:", err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
            {selectedCourse}
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mt-1">
            Grade Calculator
          </p>
        </div>
        {hasUnsavedChanges && (
          <button
            onClick={handleSaveChanges}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            Save Changes
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-indigo-50 dark:bg-dark-bg-tertiary rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
            Current Grade
          </h3>
          {currentGrade !== null ? (
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {currentGrade.toFixed(1)}%
            </div>
          ) : (
            <div className="text-gray-500 dark:text-dark-text-tertiary">
              No completed assessments yet
            </div>
          )}
        </div>
        <div className="p-4 bg-indigo-50 dark:bg-dark-bg-tertiary rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
            Course Weight
          </h3>
          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {totalWeight}%
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="rounded-lg border border-gray-200 dark:border-dark-border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
            <thead className="bg-gray-50 dark:bg-dark-bg-tertiary">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                  Assessment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider w-32">
                  Weight
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider w-32">
                  Mark
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-bg-secondary divide-y divide-gray-200 dark:divide-dark-border">
              {assessments.map((assessment) => (
                <tr
                  key={assessment.id}
                  className="hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                      {assessment.assignmentName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-1">
                      {assessment.status}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        max="100"
                        step="0.1"
                        value={assessment.weight}
                        onChange={(e) =>
                          handleWeightChange(assessment.id, e.target.value)
                        }
                        className="w-20 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0-100"
                      />
                      <span className="ml-1 text-gray-500 dark:text-dark-text-tertiary">
                        %
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.1"
                        value={assessment.mark ?? ""}
                        onChange={(e) =>
                          handleMarkChange(assessment.id, e.target.value)
                        }
                        className="w-20 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0+"
                      />
                      <span className="ml-1 text-gray-500 dark:text-dark-text-tertiary">
                        %
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GradeCalculator;
