import type { ReactNode } from "react";
import type { Timestamp } from "firebase/firestore";

export type AssessmentStatus = "Not started" | "In progress" | "Submitted" | "Missed";

export interface Assessment {
  id?: string; // Made optional since it may not exist during creation
  courseName: string;
  assignmentName: string;
  dueDate: string;
  dueTime: string;
  weight: number;
  status: AssessmentStatus;
  notes?: string;
  mark?: number | null;
  /** Set by the upload when no usable due date was found; the date is a placeholder. */
  needsReview?: boolean;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export interface AddAssessmentFormProps {
  semesterId: string;
}

export interface AssessmentsTableProps {
  assessments: Assessment[];
  semesterId: string;
  /** Panel title; the course-filtered view passes its breadcrumb here. */
  title?: ReactNode;
  courseColors: Record<string, string>;
}
