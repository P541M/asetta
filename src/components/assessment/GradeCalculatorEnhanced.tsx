import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { updateDoc } from "firebase/firestore";
import { useAssessments } from "../../hooks/useAssessments";
import { getAssessmentDocRef } from "../../lib/firebaseUtils";
import { Assessment } from "../../types/assessment";

interface GradeCalculatorEnhancedProps {
  semesterId: string;
  selectedCourse: string | null;
}

interface GradeInfo {
  letter: string;
  gpa: number;
  color: string;
  bgColor: string;
}

const GradeCalculatorEnhanced: React.FC<GradeCalculatorEnhancedProps> = ({
  semesterId,
  selectedCourse,
}) => {
  const { user } = useAuth();
  const [currentGrade, setCurrentGrade] = useState<number | null>(null);
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [targetGrade, setTargetGrade] = useState<number>(85);

  const {
    assessments: fetchedAssessments,
    loading: isLoading,
    error,
    refetch,
  } = useAssessments(semesterId, selectedCourse ? { courseName: selectedCourse } : {});

  const [assessments, setAssessments] = useState<Assessment[]>([]);

  // Grade scale configuration
  const getGradeInfo = (percentage: number): GradeInfo => {
    if (percentage >= 90) return { letter: "A+", gpa: 4.0, color: "text-green-600", bgColor: "bg-green-100" };
    if (percentage >= 85) return { letter: "A", gpa: 4.0, color: "text-green-600", bgColor: "bg-green-100" };
    if (percentage >= 80) return { letter: "A-", gpa: 3.7, color: "text-green-500", bgColor: "bg-green-50" };
    if (percentage >= 77) return { letter: "B+", gpa: 3.3, color: "text-blue-600", bgColor: "bg-blue-100" };
    if (percentage >= 73) return { letter: "B", gpa: 3.0, color: "text-blue-600", bgColor: "bg-blue-100" };
    if (percentage >= 70) return { letter: "B-", gpa: 2.7, color: "text-blue-500", bgColor: "bg-blue-50" };
    if (percentage >= 67) return { letter: "C+", gpa: 2.3, color: "text-yellow-600", bgColor: "bg-yellow-100" };
    if (percentage >= 63) return { letter: "C", gpa: 2.0, color: "text-yellow-600", bgColor: "bg-yellow-100" };
    if (percentage >= 60) return { letter: "C-", gpa: 1.7, color: "text-yellow-500", bgColor: "bg-yellow-50" };
    if (percentage >= 57) return { letter: "D+", gpa: 1.3, color: "text-orange-600", bgColor: "bg-orange-100" };
    if (percentage >= 53) return { letter: "D", gpa: 1.0, color: "text-orange-600", bgColor: "bg-orange-100" };
    if (percentage >= 50) return { letter: "D-", gpa: 0.7, color: "text-red-500", bgColor: "bg-red-50" };
    return { letter: "F", gpa: 0.0, color: "text-red-600", bgColor: "bg-red-100" };
  };

  useEffect(() => {
    const sortedAssessments = [...fetchedAssessments].sort((a, b) => {
      const dateA = new Date(`${a.dueDate}T${a.dueTime}`);
      const dateB = new Date(`${b.dueDate}T${b.dueTime}`);
      return dateA.getTime() - dateB.getTime();
    });

    setAssessments(sortedAssessments);

    const total = sortedAssessments.reduce((sum, assessment) => sum + assessment.weight, 0);
    setTotalWeight(total);

    const completedAssessments = sortedAssessments.filter(
      (a) => a.status === "Submitted" && a.mark !== null && a.mark !== undefined
    );

    if (completedAssessments.length > 0) {
      const weightedSum = completedAssessments.reduce((sum, assessment) => {
        if (assessment.mark === null || assessment.mark === undefined) return sum;
        return sum + (assessment.mark * assessment.weight) / 100;
      }, 0);
      const completedWeight = completedAssessments.reduce((sum, assessment) => {
        if (assessment.mark === null || assessment.mark === undefined) return sum;
        return sum + assessment.weight;
      }, 0);
      setCurrentGrade(completedWeight > 0 ? (weightedSum / completedWeight) * 100 : 0);
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

    recalculateGrade(assessments.map((assessment) =>
      assessment.id === assessmentId
        ? { ...assessment, mark, status: "Submitted" }
        : assessment
    ));

    setHasUnsavedChanges(true);
  };

  const handleWeightChange = (assessmentId: string, value: string) => {
    const newWeight = value === "" ? 0 : Math.min(100, Math.max(0, parseFloat(value) || 0));

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

    const total = updatedAssessments.reduce((sum, assessment) => sum + assessment.weight, 0);
    setTotalWeight(total);

    recalculateGrade(updatedAssessments);
    setHasUnsavedChanges(true);
  };

  const recalculateGrade = (updatedAssessments: Assessment[]) => {
    const completedAssessments = updatedAssessments.filter(
      (a) => a.status === "Submitted" && a.mark !== null && a.mark !== undefined
    );

    if (completedAssessments.length > 0) {
      const weightedSum = completedAssessments.reduce((sum, assessment) => {
        if (assessment.mark === null || assessment.mark === undefined) return sum;
        return sum + (assessment.mark * assessment.weight) / 100;
      }, 0);
      const completedWeight = completedAssessments.reduce((sum, assessment) => {
        if (assessment.mark === null || assessment.mark === undefined) return sum;
        return sum + assessment.weight;
      }, 0);
      setCurrentGrade(completedWeight > 0 ? (weightedSum / completedWeight) * 100 : 0);
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

    const currentWeightedSum = completedAssessments.reduce((sum, assessment) => {
      if (assessment.mark === null || assessment.mark === undefined) return sum;
      return sum + (assessment.mark * assessment.weight) / 100;
    }, 0);

    const remainingWeight = remainingAssessments.reduce((sum, assessment) => sum + assessment.weight, 0);
    const targetWeightedSum = (targetGrade * totalWeight) / 100;
    const requiredWeightedSum = targetWeightedSum - currentWeightedSum;

    return remainingWeight > 0 ? (requiredWeightedSum / remainingWeight) * 100 : 0;
  };

  const handleSaveChanges = async () => {
    if (!user || !semesterId || !hasUnsavedChanges) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      for (const assessment of assessments) {
        if (!assessment.id) continue;
        const assessmentRef = getAssessmentDocRef(user.uid, semesterId, assessment.id);
        const mark = assessment.mark === undefined ? null : assessment.mark;

        await updateDoc(assessmentRef, {
          mark,
          weight: assessment.weight,
          status: assessment.status,
        });
      }

      setHasUnsavedChanges(false);
      refetch();
    } catch (err) {
      console.error("Error saving assessment changes:", err);
      setSaveError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getAssessmentStatus = (assessment: Assessment) => {
    const now = new Date();
    const dueDate = new Date(`${assessment.dueDate}T${assessment.dueTime}`);
    
    if (assessment.status === "Submitted") {
      return { icon: "✓", color: "text-green-600", bgColor: "bg-green-100" };
    } else if (dueDate < now) {
      return { icon: "!", color: "text-red-600", bgColor: "bg-red-100" };
    } else {
      return { icon: "○", color: "text-yellow-600", bgColor: "bg-yellow-100" };
    }
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 85) return "bg-green-500";
    if (percentage >= 70) return "bg-blue-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (!selectedCourse) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-dark-text-tertiary">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
        <h3 className="text-lg font-medium mb-2 dark:text-dark-text-primary">
          No course selected
        </h3>
        <p>
          Select a course from the dropdown to view grade calculations.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 dark:border-primary-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-md text-red-700 animate-fade-in shadow-sm">
        <p>{error}</p>
      </div>
    );
  }

  const currentGradeInfo = currentGrade !== null ? getGradeInfo(currentGrade) : null;
  const requiredGrade = calculateRequiredGrade();

  return (
    <div className="space-y-6">
      {/* Header with Save Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
            {selectedCourse}
          </h3>
          <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mt-1">
            Grade calculator and progress tracking
          </p>
        </div>
        {hasUnsavedChanges && (
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className={`btn-primary ${isSaving ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>

      {saveError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md text-red-700 dark:text-red-400 animate-fade-in shadow-sm">
          <p>{saveError}</p>
        </div>
      )}

      {/* Grade Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Grade */}
        <div className="bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border-primary rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 dark:text-dark-text-primary">
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
              <div className="text-2xl font-semibold text-gray-900 dark:text-dark-text-primary">
                {currentGrade.toFixed(1)}%
              </div>
              <div className="w-full bg-gray-100 dark:bg-dark-bg-tertiary rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${getProgressBarColor(currentGrade)}`}
                  style={{ width: `${Math.min(currentGrade, 100)}%` }}
                ></div>
              </div>
              {currentGradeInfo && (
                <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                  GPA: {currentGradeInfo.gpa}
                </p>
              )}
            </div>
          ) : (
            <div className="text-gray-500 dark:text-dark-text-tertiary text-sm">
              No completed assessments yet
            </div>
          )}
        </div>

        {/* Course Weight */}
        <div className="bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border-primary rounded-lg p-6">
          <h3 className="font-medium text-gray-900 dark:text-dark-text-primary mb-3">
            Course Weight
          </h3>
          <div className="space-y-3">
            <div className="text-2xl font-semibold text-gray-900 dark:text-dark-text-primary">
              {totalWeight}%
            </div>
            <div className="w-full bg-gray-100 dark:bg-dark-bg-tertiary rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  totalWeight === 100 ? "bg-green-500" : totalWeight >= 90 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${Math.min(totalWeight, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
              {totalWeight === 100 ? "Complete" : totalWeight > 100 ? "Over 100%" : `${100 - totalWeight}% remaining`}
            </p>
          </div>
        </div>

        {/* Target Grade & Projection */}
        <div className="bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border-primary rounded-lg p-6">
          <h3 className="font-medium text-gray-900 dark:text-dark-text-primary mb-3">
            Target Grade
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                max="100"
                value={targetGrade}
                onChange={(e) => setTargetGrade(parseFloat(e.target.value) || 0)}
                className="input w-16 px-2 py-1 text-sm hover:shadow-sm transition-all duration-200 dark:bg-dark-input-bg dark:text-dark-input-text dark:border-dark-input-border"
              />
              <span className="text-gray-500 dark:text-dark-text-tertiary text-sm">%</span>
            </div>
            {requiredGrade !== null && (
              <div className="text-sm">
                <p className="text-gray-700 dark:text-dark-text-secondary">
                  Need avg of{" "}
                  <span className={`font-medium ${requiredGrade > 100 ? "text-red-600" : "text-green-600"}`}>
                    {requiredGrade.toFixed(1)}%
                  </span>
                </p>
                <p className="text-gray-500 dark:text-dark-text-tertiary">
                  on remaining assessments
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assessment Breakdown */}
      <div className="bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border-primary rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border-primary">
          <h3 className="font-medium text-gray-900 dark:text-dark-text-primary">
            Assessment Breakdown
          </h3>
          <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mt-1">
            Edit weights and marks to calculate your grade
          </p>
        </div>
        
        <div className="p-6">
          {assessments.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-dark-text-tertiary">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
              <h3 className="text-lg font-medium mb-2 dark:text-dark-text-primary">
                No assessments found
              </h3>
              <p>
                This course doesn&apos;t have any assessments yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Headers */}
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-100/50 dark:bg-dark-bg-tertiary/50 rounded-lg">
                <div className="col-span-12 lg:col-span-4 flex items-center">
                  <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                    Assessment
                  </span>
                </div>
                <div className="col-span-12 lg:col-span-2 flex items-center">
                  <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                    Status
                  </span>
                </div>
                <div className="col-span-12 lg:col-span-2 flex items-center">
                  <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                    Weight
                  </span>
                </div>
                <div className="col-span-12 lg:col-span-2 flex items-center">
                  <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                    Mark
                  </span>
                </div>
                <div className="col-span-12 lg:col-span-2 flex items-center">
                  <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                    Points
                  </span>
                </div>
              </div>

              {/* Assessment Cards */}
              <div className="space-y-3">
                {assessments.map((assessment) => {
                  const status = getAssessmentStatus(assessment);
                  const contribution = assessment.mark && assessment.weight 
                    ? ((assessment.mark * assessment.weight) / 100).toFixed(1)
                    : "0.0";

                  return (
                    <div
                      key={assessment.id}
                      className="bg-gray-50/50 dark:bg-dark-bg-tertiary/30 rounded-lg transition-all duration-300 p-4 hover:bg-gray-100/50 dark:hover:bg-dark-bg-tertiary/50"
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-12 lg:col-span-4">
                          <h3 className="font-medium text-gray-900 dark:text-dark-text-primary text-sm">
                            {assessment.assignmentName}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-1">
                            Due: {new Date(assessment.dueDate).toLocaleDateString()}
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
                                assessment.id && handleWeightChange(assessment.id, e.target.value)
                              }
                              className="input w-16 px-2 py-1 text-sm hover:shadow-sm transition-all duration-200 dark:bg-dark-input-bg dark:text-dark-input-text dark:border-dark-input-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-xs text-gray-500 dark:text-dark-text-tertiary">%</span>
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
                                assessment.id && handleMarkChange(assessment.id, e.target.value)
                              }
                              className="input w-16 px-2 py-1 text-sm hover:shadow-sm transition-all duration-200 dark:bg-dark-input-bg dark:text-dark-input-text dark:border-dark-input-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder="--"
                            />
                            <span className="text-xs text-gray-500 dark:text-dark-text-tertiary">%</span>
                          </div>
                        </div>
                        <div className="col-span-12 lg:col-span-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
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

export default GradeCalculatorEnhanced;