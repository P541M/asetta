import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { updateDoc } from "firebase/firestore";
import { useAssessments } from "../../hooks/useAssessments";
import { useAutoSave } from "../../hooks/useAutoSave";
import { useCoursePreferences } from "../../hooks/useCoursePreferences";
import { getAssessmentDocRef } from "../../lib/firebaseUtils";
import { Assessment } from "../../types/assessment";
import {
  computeCurrentGrade,
  computeTotalWeight,
  calculateRequiredGrade,
  getGradeInfo,
} from "../../utils/gradeCalculations";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";
import EmptyState from "../ui/EmptyState";
import GradeOverviewCards from "./grade-calculator/GradeOverviewCards";
import AssessmentBreakdown from "./grade-calculator/AssessmentBreakdown";

interface GradeCalculatorProps {
  semesterId: string;
  selectedCourse: string | null;
  onAutoSaveStatusChange?: (status: "idle" | "saving" | "saved" | "error", error?: string) => void;
}

const GradeCalculator: React.FC<GradeCalculatorProps> = ({
  semesterId,
  selectedCourse,
  onAutoSaveStatusChange,
}) => {
  const { user } = useAuth();
  const [currentGrade, setCurrentGrade] = useState<number | null>(null);
  const [totalWeight, setTotalWeight] = useState<number>(0);

  // Course preferences hook for target grade
  const {
    preferences: coursePreferences,
    loading: preferencesLoading,
    error: preferencesError,
    updateTargetGrade,
  } = useCoursePreferences(semesterId, selectedCourse);

  const {
    assessments: fetchedAssessments,
    loading: isLoading,
    error,
  } = useAssessments(semesterId, selectedCourse ? { courseName: selectedCourse } : {});

  const [assessments, setAssessments] = useState<Assessment[]>([]);

  // Prepare data for auto-save (only include modified fields)
  const assessmentData = useMemo(
    () =>
      assessments.map((assessment) => ({
        id: assessment.id,
        mark: assessment.mark,
        weight: assessment.weight,
        status: assessment.status,
      })),
    [assessments],
  );

  // Auto-save function
  const handleAutoSave = useCallback(
    async (data: typeof assessmentData) => {
      if (!user || !semesterId) return;

      for (const assessmentUpdate of data) {
        if (!assessmentUpdate.id) continue;
        const assessmentRef = getAssessmentDocRef(user.uid, semesterId, assessmentUpdate.id);
        const mark = assessmentUpdate.mark === undefined ? null : assessmentUpdate.mark;

        await updateDoc(assessmentRef, {
          mark,
          weight: assessmentUpdate.weight,
          status: assessmentUpdate.status,
        });
      }

      // No need to refetch - local state is already updated optimistically
      // and represents the correct current state after Firebase update
    },
    [user, semesterId],
  );

  // Auto-save hook
  const { status: saveStatus, error: saveError } = useAutoSave({
    data: assessmentData,
    onSave: handleAutoSave,
    enabled: Boolean(user && semesterId),
  });

  // Notify parent of auto-save status changes
  useEffect(() => {
    onAutoSaveStatusChange?.(saveStatus, saveError || undefined);
  }, [saveStatus, saveError, onAutoSaveStatusChange]);

  useEffect(() => {
    const sortedAssessments = [...fetchedAssessments].sort((a, b) => {
      const dateA = new Date(`${a.dueDate}T${a.dueTime}`);
      const dateB = new Date(`${b.dueDate}T${b.dueTime}`);
      return dateA.getTime() - dateB.getTime();
    });

    setAssessments(sortedAssessments);
    setTotalWeight(computeTotalWeight(sortedAssessments));
    setCurrentGrade(computeCurrentGrade(sortedAssessments));
  }, [fetchedAssessments]);

  // Recompute the grade after an edit; keeps the previous value when nothing is completed
  const recalculateGrade = (updatedAssessments: Assessment[]) => {
    const grade = computeCurrentGrade(updatedAssessments);
    if (grade !== null) {
      setCurrentGrade(grade);
    }
  };

  const handleMarkChange = (assessmentId: string, value: string) => {
    const mark = value === "" ? null : Math.max(0, parseFloat(value) || 0);

    setAssessments((prevAssessments) =>
      prevAssessments.map((assessment) =>
        assessment.id === assessmentId ? { ...assessment, mark, status: "Submitted" } : assessment,
      ),
    );

    recalculateGrade(
      assessments.map((assessment) =>
        assessment.id === assessmentId ? { ...assessment, mark, status: "Submitted" } : assessment,
      ),
    );
  };

  const handleWeightChange = (assessmentId: string, value: string) => {
    const newWeight = value === "" ? 0 : Math.min(100, Math.max(0, parseFloat(value) || 0));

    setAssessments((prevAssessments) =>
      prevAssessments.map((assessment) =>
        assessment.id === assessmentId ? { ...assessment, weight: newWeight } : assessment,
      ),
    );

    const updatedAssessments = assessments.map((assessment) =>
      assessment.id === assessmentId ? { ...assessment, weight: newWeight } : assessment,
    );

    setTotalWeight(computeTotalWeight(updatedAssessments));
    recalculateGrade(updatedAssessments);
  };

  const handleTargetGradeChange = async (newTargetGrade: number) => {
    try {
      await updateTargetGrade(newTargetGrade);
    } catch (error) {
      console.error("Failed to update target grade:", error);
    }
  };

  if (!selectedCourse) {
    return (
      <EmptyState
        icon={
          <svg
            className="mx-auto h-12 w-12 text-light-text-tertiary dark:text-dark-text-tertiary mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        }
        title="No course selected"
        description="Select a course from the dropdown to view grade calculations."
        className="py-10 text-light-text-tertiary dark:text-dark-text-tertiary"
      />
    );
  }

  if (isLoading || preferencesLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (preferencesError) {
    return <ErrorMessage message={`Course preferences error: ${preferencesError}`} />;
  }

  const currentGradeInfo = currentGrade !== null ? getGradeInfo(currentGrade) : null;
  const requiredGrade = coursePreferences
    ? calculateRequiredGrade(assessments, coursePreferences.targetGrade, totalWeight)
    : null;

  return (
    <div className="space-y-6">
      {saveStatus === "error" && saveError && (
        <div className="p-4 bg-light-error-bg dark:bg-dark-error-bg rounded-md text-light-error-text dark:text-dark-error-text animate-fade-in shadow-sm">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>{saveError}</p>
          </div>
        </div>
      )}

      {/* Grade Overview Cards */}
      <GradeOverviewCards
        currentGrade={currentGrade}
        currentGradeInfo={currentGradeInfo}
        totalWeight={totalWeight}
        targetGrade={coursePreferences?.targetGrade || 85}
        onTargetGradeChange={handleTargetGradeChange}
        preferencesLoading={preferencesLoading}
        requiredGrade={requiredGrade}
      />

      {/* Assessment Breakdown */}
      <AssessmentBreakdown
        assessments={assessments}
        onWeightChange={handleWeightChange}
        onMarkChange={handleMarkChange}
      />
    </div>
  );
};

export default GradeCalculator;
