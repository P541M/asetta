import { Assessment } from "../types/assessment";
import { isCompletedStatus } from "../constants/assessment";

export interface GradeInfo {
  letter: string;
  gpa: number;
  /** Tint chip classes (bg + text) for the letter badge, e.g. `bg-success/10 text-success`. */
  tintClass: string;
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

// Three semantic tints instead of five raw-palette bands: A reads as success,
// B/C as the neutral amber, D/F as trouble (2026-07-15 judgment call).
const successTint = "bg-success/10 text-success";
const primaryTint = "bg-primary/10 text-primary";
const destructiveTint = "bg-destructive/10 text-destructive";

/** Letter grade / GPA scale, including the tint chip classes each band renders with. */
export function getGradeInfo(percentage: number): GradeInfo {
  if (percentage >= 90) return { letter: "A+", gpa: 4.0, tintClass: successTint };
  if (percentage >= 85) return { letter: "A", gpa: 4.0, tintClass: successTint };
  if (percentage >= 80) return { letter: "A-", gpa: 3.7, tintClass: successTint };
  if (percentage >= 77) return { letter: "B+", gpa: 3.3, tintClass: primaryTint };
  if (percentage >= 73) return { letter: "B", gpa: 3.0, tintClass: primaryTint };
  if (percentage >= 70) return { letter: "B-", gpa: 2.7, tintClass: primaryTint };
  if (percentage >= 67) return { letter: "C+", gpa: 2.3, tintClass: primaryTint };
  if (percentage >= 63) return { letter: "C", gpa: 2.0, tintClass: primaryTint };
  if (percentage >= 60) return { letter: "C-", gpa: 1.7, tintClass: primaryTint };
  if (percentage >= 57) return { letter: "D+", gpa: 1.3, tintClass: destructiveTint };
  if (percentage >= 53) return { letter: "D", gpa: 1.0, tintClass: destructiveTint };
  if (percentage >= 50) return { letter: "D-", gpa: 0.7, tintClass: destructiveTint };
  return { letter: "F", gpa: 0.0, tintClass: destructiveTint };
}

export function getProgressBarColor(percentage: number): string {
  if (percentage >= 85) return "bg-success";
  if (percentage >= 60) return "bg-primary";
  return "bg-destructive";
}
