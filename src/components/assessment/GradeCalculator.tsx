import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { updateDoc } from "firebase/firestore";
import { useAssessments } from "../../hooks/useAssessments";
import { useAutoSave } from "../../hooks/useAutoSave";
import { getAssessmentDocRef } from "../../lib/firebaseUtils";
import { Assessment } from "../../types/assessment";
import { LoadingSpinner, ErrorMessage, EmptyState } from "../ui";

interface GradeCalculatorProps {
  semesterId: string;
  selectedCourse: string | null;
}

interface GradeInfo {
  letter: string;
  gpa: number;
  color: string;
  bgColor: string;
}

const GradeCalculator: React.FC<GradeCalculatorProps> = ({
  semesterId,
  selectedCourse,
}) => {
  const { user } = useAuth();
  const [currentGrade, setCurrentGrade] = useState<number | null>(null);
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [targetGrade, setTargetGrade] = useState<number>(85);

  const {
    assessments: fetchedAssessments,
    loading: isLoading,
    error,
  } = useAssessments(
    semesterId,
    selectedCourse ? { courseName: selectedCourse } : {}
  );

  const [assessments, setAssessments] = useState<Assessment[]>([]);

  // Prepare data for auto-save (only include modified fields)
  const assessmentData = useMemo(() => 
    assessments.map(assessment => ({
      id: assessment.id,
      mark: assessment.mark,
      weight: assessment.weight,
      status: assessment.status
    }))
  , [assessments]);

  // Auto-save function
  const handleAutoSave = useCallback(async (data: typeof assessmentData) => {
    if (!user || !semesterId) return;

    for (const assessmentUpdate of data) {
      if (!assessmentUpdate.id) continue;
      const assessmentRef = getAssessmentDocRef(
        user.uid,
        semesterId,
        assessmentUpdate.id
      );
      const mark = assessmentUpdate.mark === undefined ? null : assessmentUpdate.mark;

      await updateDoc(assessmentRef, {
        mark,
        weight: assessmentUpdate.weight,
        status: assessmentUpdate.status,
      });
    }

    // No need to refetch - local state is already updated optimistically
    // and represents the correct current state after Firebase update
  }, [user, semesterId]);

  // Auto-save hook
  const { status: saveStatus, error: saveError } = useAutoSave({
    data: assessmentData,
    onSave: handleAutoSave,
    enabled: Boolean(user && semesterId)
  });

  // Grade scale configuration
  const getGradeInfo = (percentage: number): GradeInfo => {
    if (percentage >= 90)
      return {
        letter: "A+",
        gpa: 4.0,
        color: "text-light-grade-a-text dark:text-dark-grade-a-text",
        bgColor: "bg-light-grade-a-bg dark:bg-dark-grade-a-bg",
      };
    if (percentage >= 85)
      return {
        letter: "A",
        gpa: 4.0,
        color: "text-light-grade-a-text dark:text-dark-grade-a-text",
        bgColor: "bg-light-grade-a-bg dark:bg-dark-grade-a-bg",
      };
    if (percentage >= 80)
      return {
        letter: "A-",
        gpa: 3.7,
        color: "text-light-grade-a-text dark:text-dark-grade-a-text",
        bgColor: "bg-light-grade-a-bg dark:bg-dark-grade-a-bg",
      };
    if (percentage >= 77)
      return {
        letter: "B+",
        gpa: 3.3,
        color: "text-light-grade-b-text dark:text-dark-grade-b-text",
        bgColor: "bg-light-grade-b-bg dark:bg-dark-grade-b-bg",
      };
    if (percentage >= 73)
      return {
        letter: "B",
        gpa: 3.0,
        color: "text-light-grade-b-text dark:text-dark-grade-b-text",
        bgColor: "bg-light-grade-b-bg dark:bg-dark-grade-b-bg",
      };
    if (percentage >= 70)
      return {
        letter: "B-",
        gpa: 2.7,
        color: "text-light-grade-b-text dark:text-dark-grade-b-text",
        bgColor: "bg-light-grade-b-bg dark:bg-dark-grade-b-bg",
      };
    if (percentage >= 67)
      return {
        letter: "C+",
        gpa: 2.3,
        color: "text-light-grade-c-text dark:text-dark-grade-c-text",
        bgColor: "bg-light-grade-c-bg dark:bg-dark-grade-c-bg",
      };
    if (percentage >= 63)
      return {
        letter: "C",
        gpa: 2.0,
        color: "text-light-grade-c-text dark:text-dark-grade-c-text",
        bgColor: "bg-light-grade-c-bg dark:bg-dark-grade-c-bg",
      };
    if (percentage >= 60)
      return {
        letter: "C-",
        gpa: 1.7,
        color: "text-light-grade-c-text dark:text-dark-grade-c-text",
        bgColor: "bg-light-grade-c-bg dark:bg-dark-grade-c-bg",
      };
    if (percentage >= 57)
      return {
        letter: "D+",
        gpa: 1.3,
        color: "text-light-grade-d-text dark:text-dark-grade-d-text",
        bgColor: "bg-light-grade-d-bg dark:bg-dark-grade-d-bg",
      };
    if (percentage >= 53)
      return {
        letter: "D",
        gpa: 1.0,
        color: "text-light-grade-d-text dark:text-dark-grade-d-text",
        bgColor: "bg-light-grade-d-bg dark:bg-dark-grade-d-bg",
      };
    if (percentage >= 50)
      return {
        letter: "D-",
        gpa: 0.7,
        color: "text-light-grade-f-text dark:text-dark-grade-f-text",
        bgColor: "bg-light-grade-f-bg dark:bg-dark-grade-f-bg",
      };
    return {
      letter: "F",
      gpa: 0.0,
      color: "text-light-grade-f-text dark:text-dark-grade-f-text",
      bgColor: "bg-light-grade-f-bg dark:bg-dark-grade-f-bg",
    };
  };

  useEffect(() => {
    const sortedAssessments = [...fetchedAssessments].sort((a, b) => {
      const dateA = new Date(`${a.dueDate}T${a.dueTime}`);
      const dateB = new Date(`${b.dueDate}T${b.dueTime}`);
      return dateA.getTime() - dateB.getTime();
    });

    setAssessments(sortedAssessments);

    const total = sortedAssessments.reduce(
      (sum, assessment) => sum + assessment.weight,
      0
    );
    setTotalWeight(total);

    const completedAssessments = sortedAssessments.filter(
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
  }, [fetchedAssessments]);

  const handleMarkChange = (assessmentId: string, value: string) => {
    const mark = value === "" ? null : Math.max(0, parseFloat(value) || 0);

    setAssessments((prevAssessments) =>
      prevAssessments.map((assessment) =>
        assessment.id === assessmentId
          ? { ...assessment, mark, status: "Submitted" }
          : assessment
      )
    );

    recalculateGrade(
      assessments.map((assessment) =>
        assessment.id === assessmentId
          ? { ...assessment, mark, status: "Submitted" }
          : assessment
      )
    );
  };

  const handleWeightChange = (assessmentId: string, value: string) => {
    const newWeight =
      value === "" ? 0 : Math.min(100, Math.max(0, parseFloat(value) || 0));

    setAssessments((prevAssessments) =>
      prevAssessments.map((assessment) =>
        assessment.id === assessmentId
          ? { ...assessment, weight: newWeight }
          : assessment
      )
    );

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

    recalculateGrade(updatedAssessments);
  };

  const recalculateGrade = (updatedAssessments: Assessment[]) => {
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
  };

  const calculateRequiredGrade = () => {
    const completedAssessments = assessments.filter(
      (a) => a.status === "Submitted" && a.mark !== null && a.mark !== undefined
    );
    const remainingAssessments = assessments.filter(
      (a) => a.status !== "Submitted" || a.mark === null || a.mark === undefined
    );

    if (remainingAssessments.length === 0) return null;

    const currentWeightedSum = completedAssessments.reduce(
      (sum, assessment) => {
        if (assessment.mark === null || assessment.mark === undefined)
          return sum;
        return sum + (assessment.mark * assessment.weight) / 100;
      },
      0
    );

    const remainingWeight = remainingAssessments.reduce(
      (sum, assessment) => sum + assessment.weight,
      0
    );
    const targetWeightedSum = (targetGrade * totalWeight) / 100;
    const requiredWeightedSum = targetWeightedSum - currentWeightedSum;

    return remainingWeight > 0
      ? (requiredWeightedSum / remainingWeight) * 100
      : 0;
  };


  const getAssessmentStatus = (assessment: Assessment) => {
    const now = new Date();
    const dueDate = new Date(`${assessment.dueDate}T${assessment.dueTime}`);

    if (assessment.status === "Submitted") {
      return { icon: "✓", color: "text-light-status-submitted-text dark:text-dark-status-submitted-text", bgColor: "bg-light-status-submitted-bg dark:bg-dark-status-submitted-bg" };
    } else if (dueDate < now) {
      return { icon: "!", color: "text-light-status-overdue-text dark:text-dark-status-overdue-text", bgColor: "bg-light-status-overdue-bg dark:bg-dark-status-overdue-bg" };
    } else {
      return { icon: "○", color: "text-light-status-pending-text dark:text-dark-status-pending-text", bgColor: "bg-light-status-pending-bg dark:bg-dark-status-pending-bg" };
    }
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 85) return "bg-light-performance-excellent-bg dark:bg-dark-performance-excellent-bg";
    if (percentage >= 70) return "bg-light-performance-good-bg dark:bg-dark-performance-good-bg";
    if (percentage >= 60) return "bg-light-performance-average-bg dark:bg-dark-performance-average-bg";
    return "bg-light-performance-poor-bg dark:bg-dark-performance-poor-bg";
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const currentGradeInfo =
    currentGrade !== null ? getGradeInfo(currentGrade) : null;
  const requiredGrade = calculateRequiredGrade();

  return (
    <div className="space-y-6">
      {/* Header with Auto-Save Status */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-medium text-light-text-primary dark:text-dark-text-primary">
            {selectedCourse}
          </h3>
          <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
            Grade calculator and progress tracking
          </p>
        </div>
        
        {/* Auto-Save Status Indicator */}
        <div className="flex items-center space-x-2 min-h-[20px]">
          {saveStatus === 'saving' && (
            <div className="flex items-center space-x-2 text-sm text-light-text-secondary dark:text-dark-text-secondary animate-fade-in transition-all duration-200 ease-out">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-light-button-primary border-t-transparent"></div>
              <span>Saving...</span>
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400 animate-fade-in transition-all duration-200 ease-out">
              <svg className="w-4 h-4 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Saved</span>
            </div>
          )}
          {saveStatus === 'error' && saveError && (
            <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400 animate-fade-in transition-all duration-200 ease-out">
              <svg className="w-4 h-4 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Error saving</span>
            </div>
          )}
        </div>
      </div>

      {saveStatus === 'error' && saveError && (
        <div className="p-4 bg-light-error-bg dark:bg-dark-error-bg rounded-md text-light-error-text dark:text-dark-error-text animate-fade-in shadow-sm">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{saveError}</p>
          </div>
        </div>
      )}

      {/* Grade Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Grade */}
        <div className="bg-light-bg-primary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary">
              Current Grade
            </h3>
            {currentGradeInfo && (
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${currentGradeInfo.bgColor} ${currentGradeInfo.color}`}
              >
                {currentGradeInfo.letter}
              </span>
            )}
          </div>
          {currentGrade !== null ? (
            <div className="space-y-3">
              <div className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary">
                {currentGrade.toFixed(1)}%
              </div>
              <div className="w-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${getProgressBarColor(
                    currentGrade
                  )}`}
                  style={{ width: `${Math.min(currentGrade, 100)}%` }}
                ></div>
              </div>
              {currentGradeInfo && (
                <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                  GPA: {currentGradeInfo.gpa}
                </p>
              )}
            </div>
          ) : (
            <div className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">
              No completed assessments yet
            </div>
          )}
        </div>

        {/* Course Weight */}
        <div className="bg-light-bg-primary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary rounded-lg p-6">
          <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
            Course Weight
          </h3>
          <div className="space-y-3">
            <div className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary">
              {totalWeight}%
            </div>
            <div className="w-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  totalWeight === 100
                    ? "bg-light-performance-excellent-bg dark:bg-dark-performance-excellent-bg"
                    : totalWeight >= 90
                    ? "bg-light-performance-average-bg dark:bg-dark-performance-average-bg"
                    : "bg-light-performance-poor-bg dark:bg-dark-performance-poor-bg"
                }`}
                style={{ width: `${Math.min(totalWeight, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
              {totalWeight === 100
                ? "Complete"
                : totalWeight > 100
                ? "Over 100%"
                : `${100 - totalWeight}% remaining`}
            </p>
          </div>
        </div>

        {/* Target Grade & Projection */}
        <div className="bg-light-bg-primary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary rounded-lg p-6">
          <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
            Target Grade
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                max="100"
                value={targetGrade}
                onChange={(e) =>
                  setTargetGrade(parseFloat(e.target.value) || 0)
                }
                className="input w-16 px-2 py-1 text-sm hover:shadow-sm transition-all duration-200 dark:bg-dark-input-bg dark:text-dark-input-text dark:border-dark-input-border"
              />
              <span className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">
                %
              </span>
            </div>
            {requiredGrade !== null && (
              <div className="text-sm">
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  Need avg of{" "}
                  <span
                    className={`font-medium ${
                      requiredGrade > 100 ? "text-light-status-overdue-text dark:text-dark-status-overdue-text" : "text-light-status-submitted-text dark:text-dark-status-submitted-text"
                    }`}
                  >
                    {requiredGrade.toFixed(1)}%
                  </span>
                </p>
                <p className="text-light-text-tertiary dark:text-dark-text-tertiary">
                  on remaining assessments
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assessment Breakdown */}
      <div className="bg-light-bg-primary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary rounded-lg">
        <div className="px-6 py-4 border-b border-light-border-primary dark:border-dark-border-primary">
          <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary">
            Assessment Breakdown
          </h3>
          <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
            Edit weights and marks to calculate your grade
          </p>
        </div>

        <div className="p-6">
          {assessments.length === 0 ? (
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
              title="No assessments found"
              description="This course doesn't have any assessments yet."
              className="py-10 text-light-text-tertiary dark:text-dark-text-tertiary"
            />
          ) : (
            <div className="space-y-4">
              {/* Headers */}
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-light-bg-secondary/50 dark:bg-dark-bg-tertiary/50 rounded-lg">
                <div className="col-span-12 lg:col-span-4 flex items-center">
                  <span className="text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                    Assessment
                  </span>
                </div>
                <div className="col-span-12 lg:col-span-2 flex items-center">
                  <span className="text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                    Status
                  </span>
                </div>
                <div className="col-span-12 lg:col-span-2 flex items-center">
                  <span className="text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                    Weight
                  </span>
                </div>
                <div className="col-span-12 lg:col-span-2 flex items-center">
                  <span className="text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                    Mark
                  </span>
                </div>
                <div className="col-span-12 lg:col-span-2 flex items-center">
                  <span className="text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                    Points
                  </span>
                </div>
              </div>

              {/* Assessment Cards */}
              <div className="space-y-3">
                {assessments.map((assessment) => {
                  const status = getAssessmentStatus(assessment);
                  const contribution =
                    assessment.mark && assessment.weight
                      ? ((assessment.mark * assessment.weight) / 100).toFixed(1)
                      : "0.0";

                  return (
                    <div
                      key={assessment.id}
                      className="bg-light-bg-secondary/50 dark:bg-dark-bg-tertiary/30 rounded-lg transition-all duration-300 p-4 hover:bg-light-hover-primary/50 dark:hover:bg-dark-hover-primary/50"
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-12 lg:col-span-4">
                          <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary text-sm">
                            {assessment.assignmentName}
                          </h3>
                          <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                            Due:{" "}
                            {new Date(assessment.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="col-span-12 lg:col-span-2">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${status.bgColor} ${status.color}`}
                            title={assessment.status}
                          >
                            {status.icon}
                          </span>
                        </div>
                        <div className="col-span-12 lg:col-span-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={assessment.weight}
                              onChange={(e) =>
                                assessment.id &&
                                handleWeightChange(
                                  assessment.id,
                                  e.target.value
                                )
                              }
                              className="input w-16 px-2 py-1 text-sm hover:shadow-sm transition-all duration-200 dark:bg-dark-input-bg dark:text-dark-input-text dark:border-dark-input-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                              %
                            </span>
                          </div>
                        </div>
                        <div className="col-span-12 lg:col-span-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={assessment.mark ?? ""}
                              onChange={(e) =>
                                assessment.id &&
                                handleMarkChange(assessment.id, e.target.value)
                              }
                              className="input w-16 px-2 py-1 text-sm hover:shadow-sm transition-all duration-200 dark:bg-dark-input-bg dark:text-dark-input-text dark:border-dark-input-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder="--"
                            />
                            <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                              %
                            </span>
                          </div>
                        </div>
                        <div className="col-span-12 lg:col-span-2">
                          <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                            {contribution}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradeCalculator;
