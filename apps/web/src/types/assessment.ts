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
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export interface AddAssessmentFormProps {
  semesterId: string;
  onSuccess: () => void;
}

export interface AssessmentsTableProps {
  assessments: Assessment[];
  semesterId: string;
  onStatusChange?: (assessmentId: string, newStatus: AssessmentStatus) => void;
  /** Panel title; the course-filtered view passes its breadcrumb here. */
  title?: ReactNode;
  courseColors: Record<string, string>;
}
