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
import { ChartColumn, CircleAlert } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import LoadingSpinner from "../ui/LoadingSpinner";
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
        icon={<ChartColumn className="size-12" aria-hidden />}
        title="No course selected"
        description="Select a course from the dropdown to view grade calculations."
        className="py-10"
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
    return (
      <Alert variant="destructive">
        <CircleAlert aria-hidden />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (preferencesError) {
    return (
      <Alert variant="destructive">
        <CircleAlert aria-hidden />
        <AlertDescription>Course preferences error: {preferencesError}</AlertDescription>
      </Alert>
    );
  }

  const currentGradeInfo = currentGrade !== null ? getGradeInfo(currentGrade) : null;
  const requiredGrade = coursePreferences
    ? calculateRequiredGrade(assessments, coursePreferences.targetGrade, totalWeight)
    : null;

  return (
    <div className="space-y-6">
      {saveStatus === "error" && saveError && (
        <Alert variant="destructive">
          <CircleAlert aria-hidden />
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
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
