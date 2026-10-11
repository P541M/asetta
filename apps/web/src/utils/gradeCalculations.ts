import { Assessment } from "../types/assessment";
import { CoursePreferences, DEFAULT_COURSE_PREFERENCES } from "../types/coursePreferences";
import { isCompletedStatus } from "../constants/assessment";

export interface GradeInfo {
  letter: string;
  gpa: number;
  /** Tint chip classes (bg + text) for the letter badge, e.g. `bg-success/10 text-success`. */
  tintClass: string;
}

/**
 * The mark an assessment counts toward the grade with, or null while it is still to be
 * graded. A completed assessment counts with its mark; a Missed one without a mark counts
 * as 0 (D1 in docs/AUDIT.md).
 */
const countedMark = (a: Assessment): number | null => {
  if (!isCompletedStatus(a.status)) return null;
  if (a.mark !== null && a.mark !== undefined) return a.mark;
  return a.status === "Missed" ? 0 : null;
};

/**
 * Weighted average over the graded assessments, as a percentage.
 * Returns null ("no grade yet") until graded assessments carry some weight.
 */
export function computeCurrentGrade(assessments: Assessment[]): number | null {
  let weightedSum = 0;
  let gradedWeight = 0;
  for (const assessment of assessments) {
    const mark = countedMark(assessment);
    if (mark === null) continue;
    weightedSum += (mark * assessment.weight) / 100;
    gradedWeight += assessment.weight;
  }
  return gradedWeight > 0 ? (weightedSum / gradedWeight) * 100 : null;
}

export function computeTotalWeight(assessments: Assessment[]): number {
  return assessments.reduce((sum, assessment) => sum + assessment.weight, 0);
}

/**
 * Average mark needed on the remaining assessments to reach `targetGrade`.
 * Returns null when nothing weighted is left to grade.
 */
export function calculateRequiredGrade(
  assessments: Assessment[],
  targetGrade: number,
  totalWeight: number,
): number | null {
  let earnedWeightedSum = 0;
  let remainingWeight = 0;
  for (const assessment of assessments) {
    const mark = countedMark(assessment);
    if (mark === null) remainingWeight += assessment.weight;
    else earnedWeightedSum += (mark * assessment.weight) / 100;
  }

  if (remainingWeight <= 0) return null;

  const targetWeightedSum = (targetGrade * totalWeight) / 100;
  return ((targetWeightedSum - earnedWeightedSum) / remainingWeight) * 100;
}

/**
 * The grades tab's mark edit: an empty field clears the mark, anything else is parsed and
 * floored at 0. Entering a mark makes a Not started or In progress assessment Submitted;
 * Submitted and Missed keep their status, and clearing a mark never changes it (A41), so a
 * stray keystroke can't turn a Missed assessment into a Submitted one.
 */
export function applyMarkInput(
  assessments: Assessment[],
  assessmentId: string,
  raw: string,
): Assessment[] {
  const mark = raw === "" ? null : Math.max(0, parseFloat(raw) || 0);
  return assessments.map((assessment) => {
    if (assessment.id !== assessmentId) return assessment;
    const status =
      mark !== null && !isCompletedStatus(assessment.status)
        ? ("Submitted" as const)
        : assessment.status;
    return { ...assessment, mark, status };
  });
}

/** The target grade the tile shows and the projection uses; a saved 0 stays 0. */
export const resolveTargetGrade = (preferences: CoursePreferences | null): number =>
  preferences?.targetGrade ?? DEFAULT_COURSE_PREFERENCES.targetGrade;

/** A percentage rounded the way the tiles print it, so labels and colors match the number. */
const shown = (percentage: number): number => Number(percentage.toFixed(1));

export interface CurrentGradeView {
  /** The grade the meter is drawn at. */
  value: number;
  /** The number as shown, one decimal, without the % sign. */
  text: string;
  info: GradeInfo;
  barColor: string;
}

/**
 * How the current-grade tile shows a grade. The letter, GPA and meter color come from the
 * shown one-decimal value, so 89.96 reads "90.0%" with an A+.
 */
export function currentGradeView(grade: number): CurrentGradeView {
  const value = shown(grade);
  return {
    value,
    text: value.toFixed(1),
    info: getGradeInfo(value),
    barColor: getProgressBarColor(value),
  };
}

export type RequiredGradeView =
  { kind: "secured" } | { kind: "needed"; text: string; reachable: boolean };

/**
 * How the target tile states the average needed on the remaining assessments. At 0 or
 * below (shown value) the target holds even with no more marks, so it is "secured".
 */
export function requiredGradeView(required: number): RequiredGradeView {
  const value = shown(required);
  if (value <= 0) return { kind: "secured" };
  return { kind: "needed", text: value.toFixed(1), reachable: value <= 100 };
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
