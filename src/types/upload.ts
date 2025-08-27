export interface UploadFormProps {
  semesterId: string;
  semesterName: string;
  onUploadSuccess: (semester: string) => void;
}

export type UploadStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "success"
  | "error"
  | "rate_limited"
  | "daily_quota_exceeded";

export interface FileProgress {
  name: string;
  size: number;
  progress: number; // 0-100
  status: UploadStatus;
}

export interface ExtractionResult {
  processedFiles: number;
  totalAssessments: number;
  failedFiles?: number;
  courseBreakdown?: Array<{
    courseName: string;
    assessmentCount: number;
  }>;
  processingTime?: number;
}
