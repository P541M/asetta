import { memo, useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useAssessments } from "../../hooks/useAssessments";
import { useAssessmentAutoSave } from "../../hooks/useAssessmentAutoSave";
import { useCoursePreferences } from "../../hooks/useCoursePreferences";
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

  const {
    queueSave,
    status: saveStatus,
    error: saveError,
  } = useAssessmentAutoSave(user, semesterId);

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

    const updatedAssessments = assessments.map((assessment) =>
      assessment.id === assessmentId
        ? { ...assessment, mark, status: "Submitted" as const }
        : assessment,
    );
    setAssessments(updatedAssessments);
    recalculateGrade(updatedAssessments);

    const edited = updatedAssessments.find((assessment) => assessment.id === assessmentId);
    if (edited?.id) {
      queueSave(edited.id, { mark, weight: edited.weight, status: edited.status });
    }
  };

  const handleWeightChange = (assessmentId: string, value: string) => {
    const newWeight = value === "" ? 0 : Math.min(100, Math.max(0, parseFloat(value) || 0));

    const updatedAssessments = assessments.map((assessment) =>
      assessment.id === assessmentId ? { ...assessment, weight: newWeight } : assessment,
    );
    setAssessments(updatedAssessments);
    setTotalWeight(computeTotalWeight(updatedAssessments));
    recalculateGrade(updatedAssessments);

    const edited = updatedAssessments.find((assessment) => assessment.id === assessmentId);
    if (edited?.id) {
      queueSave(edited.id, { mark: edited.mark ?? null, weight: newWeight, status: edited.status });
    }
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
        icon={ChartColumn}
        title="No course selected"
        description="Select a course from the dropdown to view grade calculations."
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

/* Memoized: the grades tab re-renders on every shallow route change (it reads
   router.query), and this subtree is the heaviest on the dashboard */
export default memo(GradeCalculator);
