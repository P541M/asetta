export interface Assessment {
  id: string;
  courseName: string;
  assignmentName: string;
  dueDate: string;
  dueTime: string;
  weight: number;
  status: string;
  notes?: string;
  mark?: number | null;
}

export interface AddAssessmentFormProps {
  semester: string;
  semesterId: string;
  onSuccess: () => void;
}

export interface AssessmentsTableProps {
  assessments: Assessment[];
  semesterId: string;
  onStatusChange?: (assessmentId: string, newStatus: string) => void;
}
