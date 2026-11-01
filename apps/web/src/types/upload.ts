export interface UploadFormProps {
  semesterId: string;
}

export type UploadStatus =
  "idle" | "uploading" | "success" | "error" | "rate_limited" | "daily_quota_exceeded";

export interface ExtractionResult {
  processedFiles: number;
  totalAssessments: number;
  courseBreakdown?: Array<{
    courseName: string;
    assessmentCount: number;
  }>;
  processingTime?: number;
}
