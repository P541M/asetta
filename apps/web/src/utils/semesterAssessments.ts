import type { DocumentData } from "firebase/firestore";
import { Assessment } from "../types/assessment";
import { CourseStats } from "../types/course";
import { isCompletedStatus } from "../constants/assessment";
import { getTodayDateString, parseLocalDateTime } from "./dateUtils";

export interface DashboardStats {
  total: number;
  notStarted: number;
  inProgress: number;
  submitted: number;
  upcomingDeadlines: number;
  completionRate: number;
}

const dueAt = (assessment: Assessment): number =>
  parseLocalDateTime(assessment.dueDate, assessment.dueTime).getTime();

/**
 * One doc from the semester's live assessments listener, with defaults for missing fields. Every
 * dashboard view reads this, so it keeps the mark and the timestamps as stored (A11).
 */
export function assessmentFromDoc(id: string, data: DocumentData): Assessment {
  return {
    id,
    dueDate: data.dueDate || getTodayDateString(),
    status: data.status || "Not started",
    notes: data.notes || "",
    courseName: data.courseName || "Unknown Course",
    assignmentName: data.assignmentName || "Unknown Assessment",
    dueTime: data.dueTime || "23:59",
    weight: data.weight || 0,
    needsReview: data.needsReview === true,
    ...(typeof data.mark === "number" || data.mark === null ? { mark: data.mark } : {}),
    ...(data.createdAt ? { createdAt: data.createdAt } : {}),
    ...(data.updatedAt ? { updatedAt: data.updatedAt } : {}),
  };
}

/** The semester's course names, each once, sorted. */
export function courseNames(assessments: Assessment[]): string[] {
  return Array.from(new Set(assessments.map((a) => a.courseName))).sort();
}

/** Per-course progress and next deadline, sorted by course name. */
export function processCourseStats(assessmentsList: Assessment[], now: Date): CourseStats[] {
  const courseMap = new Map<string, Assessment[]>();
  assessmentsList.forEach((assessment) => {
    if (!courseMap.has(assessment.courseName)) {
      courseMap.set(assessment.courseName, []);
    }
    courseMap.get(assessment.courseName)?.push(assessment);
  });

  const courseStatsList: CourseStats[] = [];
  courseMap.forEach((assessments, courseName) => {
    const completed = assessments.filter((a) => isCompletedStatus(a.status));
    const upcomingAssessments = assessments
      // A flagged assessment's date is a placeholder, so it can't be the next deadline.
      .filter((a) => !isCompletedStatus(a.status) && !a.needsReview && dueAt(a) >= now.getTime())
      .sort((a, b) => dueAt(a) - dueAt(b));

    const nextUpcoming = upcomingAssessments[0];
    const progress =
      assessments.length > 0 ? Math.round((completed.length / assessments.length) * 100) : 0;

    courseStatsList.push({
      courseName,
      totalAssessments: assessments.length,
      pendingAssessments: assessments.length - completed.length,
      completedAssessments: completed.length,
      nextDueDate: nextUpcoming ? nextUpcoming.dueDate : null,
      nextAssignment: nextUpcoming ? nextUpcoming.assignmentName : null,
      progress,
    });
  });

  return courseStatsList.sort((a, b) => a.courseName.localeCompare(b.courseName));
}

/** The dashboard's stats bar. */
export function computeStats(assessmentsList: Assessment[], now: Date): DashboardStats {
  const oneWeek = new Date(now);
  oneWeek.setDate(now.getDate() + 7);
  const totalCount = assessmentsList.length;
  const notStartedCount = assessmentsList.filter((a) => a.status === "Not started").length;
  const inProgressCount = assessmentsList.filter((a) => a.status === "In progress").length;
  // Missed counts as done for the completion rate, but it isn't Submitted (A51)
  const completedCount = assessmentsList.filter((a) => isCompletedStatus(a.status)).length;
  const submittedCount = assessmentsList.filter((a) => a.status === "Submitted").length;
  const upcomingCount = assessmentsList.filter((a) => {
    if (a.needsReview) return false;
    const due = dueAt(a);
    return due > now.getTime() && due <= oneWeek.getTime() && !isCompletedStatus(a.status);
  }).length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  return {
    total: totalCount,
    notStarted: notStartedCount,
    inProgress: inProgressCount,
    submitted: submittedCount,
    upcomingDeadlines: upcomingCount,
    completionRate: completionRate,
  };
}
