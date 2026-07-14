import { Assessment } from "../types/assessment";
import { isCompletedStatus } from "../constants/assessment";

export interface GradeInfo {
  letter: string;
  gpa: number;
  color: string;
  bgColor: string;
}

/** An assessment counts toward the grade once completed AND given a mark. */
const hasCountableMark = (a: Assessment) =>
  isCompletedStatus(a.status) && a.mark !== null && a.mark !== undefined;

/**
 * Weighted average over completed-and-marked assessments, as a percentage.
 * Returns null when nothing is completed yet.
 */
export function computeCurrentGrade(assessments: Assessment[]): number | null {
  const completedAssessments = assessments.filter(hasCountableMark);

  if (completedAssessments.length === 0) return null;

  const weightedSum = completedAssessments.reduce((sum, assessment) => {
    if (assessment.mark === null || assessment.mark === undefined) return sum;
    return sum + (assessment.mark * assessment.weight) / 100;
  }, 0);
  const completedWeight = completedAssessments.reduce((sum, assessment) => {
    if (assessment.mark === null || assessment.mark === undefined) return sum;
    return sum + assessment.weight;
  }, 0);
  return completedWeight > 0 ? (weightedSum / completedWeight) * 100 : 0;
}

export function computeTotalWeight(assessments: Assessment[]): number {
  return assessments.reduce((sum, assessment) => sum + assessment.weight, 0);
}

/**
 * Average mark needed on the remaining assessments to reach `targetGrade`.
 * Returns null when there is nothing left to grade.
 */
export function calculateRequiredGrade(
  assessments: Assessment[],
  targetGrade: number,
  totalWeight: number,
): number | null {
  const completedAssessments = assessments.filter(hasCountableMark);
  const remainingAssessments = assessments.filter((a) => !hasCountableMark(a));

  if (remainingAssessments.length === 0) return null;

  const currentWeightedSum = completedAssessments.reduce((sum, assessment) => {
    if (assessment.mark === null || assessment.mark === undefined) return sum;
    return sum + (assessment.mark * assessment.weight) / 100;
  }, 0);

  const remainingWeight = remainingAssessments.reduce(
    (sum, assessment) => sum + assessment.weight,
    0,
  );
  const targetWeightedSum = (targetGrade * totalWeight) / 100;
  const requiredWeightedSum = targetWeightedSum - currentWeightedSum;

  return remainingWeight > 0 ? (requiredWeightedSum / remainingWeight) * 100 : 0;
}

/** Letter grade / GPA scale, including the theme classes each band renders with. */
export function getGradeInfo(percentage: number): GradeInfo {
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
}

export function getProgressBarColor(percentage: number): string {
  if (percentage >= 85)
    return "bg-light-performance-excellent-bg dark:bg-dark-performance-excellent-bg";
  if (percentage >= 70) return "bg-light-performance-good-bg dark:bg-dark-performance-good-bg";
  if (percentage >= 60)
    return "bg-light-performance-average-bg dark:bg-dark-performance-average-bg";
  return "bg-light-performance-poor-bg dark:bg-dark-performance-poor-bg";
}
