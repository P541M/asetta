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