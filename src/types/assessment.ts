export interface Assessment {
  id?: string; // Made optional since it may not exist during creation
  courseName: string;
  assignmentName: string;
  dueDate: string;
  dueTime: string;
  weight: number;
  status: 'Not started' | 'In progress' | 'Submitted' | 'Missed'; // More specific typing
  notes?: string;
  mark?: number | null;
  createdAt?: Date | FirebaseFirestore.Timestamp; // Firebase timestamp
  updatedAt?: Date | FirebaseFirestore.Timestamp; // Firebase timestamp
}

export interface AddAssessmentFormProps {
  semesterId: string;
  onSuccess: () => void;
}

export interface AssessmentsTableProps {
  assessments: Assessment[];
  semesterId: string;
  onStatusChange?: (assessmentId: string, newStatus: 'Not started' | 'In progress' | 'Submitted' | 'Missed') => void;
}
