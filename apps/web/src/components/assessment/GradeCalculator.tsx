import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useAssessmentAutoSave } from "../../hooks/useAssessmentAutoSave";
import { useCoursePreferences } from "../../hooks/useCoursePreferences";
import { Assessment } from "../../types/assessment";
import { parseLocalDateTime } from "../../utils/dateUtils";
import {
  applyMarkInput,
  computeCurrentGrade,
  computeTotalWeight,
  calculateRequiredGrade,
  GradeEdit,
  pendingEdits,
  resolveTargetGrade,
  targetToSave,
  weightEdit,
  withEdits,
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
  /** The semester's assessments, live from the dashboard's listener (A11). */
  assessments: Assessment[];
  onAutoSaveStatusChange?: (status: "idle" | "saving" | "saved" | "error", error?: string) => void;
}

const GradeCalculator: React.FC<GradeCalculatorProps> = ({
  semesterId,
  selectedCourse,
  assessments: semesterAssessments,
  onAutoSaveStatusChange,
}) => {
  const { user } = useAuth();

  // Course preferences hook for target grade
  const {
    preferences: coursePreferences,
    loading: preferencesLoading,
    error: preferencesError,
    updateTargetGrade,
  } = useCoursePreferences(semesterId, selectedCourse);

  // Typed edits the live data doesn't show yet (saves are debounced), by assessment ID
  const [edits, setEdits] = useState<Record<string, GradeEdit>>({});

  const {
    queueSave,
    status: saveStatus,
    error: saveError,
  } = useAssessmentAutoSave(user, semesterId);

  // Notify parent of auto-save status changes
  useEffect(() => {
    onAutoSaveStatusChange?.(saveStatus, saveError || undefined);
  }, [saveStatus, saveError, onAutoSaveStatusChange]);

  // Saved edits drop out once the live data shows them
  useEffect(() => {
    setEdits((current) => pendingEdits(current, semesterAssessments));
  }, [semesterAssessments]);

  const courseAssessments = useMemo(
    () =>
      semesterAssessments
        .filter((assessment) => assessment.courseName === selectedCourse)
        .sort(
          (a, b) =>
            parseLocalDateTime(a.dueDate, a.dueTime).getTime() -
            parseLocalDateTime(b.dueDate, b.dueTime).getTime(),
        ),
    [semesterAssessments, selectedCourse],
  );
  const assessments = useMemo(
    () => withEdits(courseAssessments, edits),
    [courseAssessments, edits],
  );

  const saveEdit = (assessmentId: string, edit: GradeEdit) => {
    setEdits((current) => ({ ...current, [assessmentId]: edit }));
    queueSave(assessmentId, edit);
  };

  const handleMarkChange = (assessmentId: string, value: string) => {
    const marked = applyMarkInput(assessments, assessmentId, value);
    // Text with no number changes nothing, so nothing is queued (A79)
    if (marked === assessments) return;
    const edited = marked.find((assessment) => assessment.id === assessmentId);
    if (edited?.id) {
      saveEdit(edited.id, {
        mark: edited.mark ?? null,
        weight: edited.weight,
        status: edited.status,
      });
    }
  };

  const handleWeightChange = (assessmentId: string, value: string) => {
    const edited = assessments.find((assessment) => assessment.id === assessmentId);
    const saved = courseAssessments.find((assessment) => assessment.id === assessmentId);
    const edit = edited && saved ? weightEdit(edited, value, saved.weight) : null;
    if (edited?.id && edit) saveEdit(edited.id, edit);
  };

  const saveTargetGrade = (target: number) => {
    updateTargetGrade(target).catch((error) => {
      console.error("Failed to update target grade:", error);
    });
  };

  // The target as typed: shown and projected at once, saved only when the field is left (A76).
  // The ref lets the cleanup below read the draft without re-running on each keystroke.
  const [typedTarget, setTypedTarget] = useState<number | null>(null);
  const typedTargetRef = useRef<number | null>(null);
  const setTyped = (target: number | null) => {
    typedTargetRef.current = target;
    setTypedTarget(target);
  };
  const savedTarget = resolveTargetGrade(coursePreferences);

  const commitTarget = () => {
    const target = targetToSave(typedTargetRef.current, savedTarget);
    setTyped(null);
    if (target !== null) saveTargetGrade(target);
  };

  // A draft still open when the course changes or the tab unmounts saves to its own course:
  // a removed field gets no blur
  useEffect(() => {
    const draft = typedTargetRef;
    return () => {
      const pending = draft.current;
      draft.current = null;
      setTypedTarget(null);
      if (pending !== null) {
        updateTargetGrade(pending).catch((error) => {
          console.error("Failed to update target grade:", error);
        });
      }
    };
  }, [updateTargetGrade]);

  if (!selectedCourse) {
    return (
      <EmptyState
        icon={ChartColumn}
        title="No course selected"
        description="Select a course from the dropdown to view grade calculations."
      />
    );
  }

  if (preferencesLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
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

  // Derived on every render, never kept in state, so an edit can't leave a stale value on screen
  const currentGrade = computeCurrentGrade(assessments);
  const totalWeight = computeTotalWeight(assessments);
  const targetGrade = typedTarget ?? savedTarget;
  const requiredGrade = coursePreferences
    ? calculateRequiredGrade(assessments, targetGrade, totalWeight)
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
        totalWeight={totalWeight}
        targetGrade={targetGrade}
        onTargetInput={setTyped}
        onTargetCommit={commitTarget}
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
