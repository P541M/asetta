export interface UploadFormProps {
  semester: string;
  onUploadSuccess: (semester: string) => void;
}

export type UploadStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "success"
  | "error"
  | "rate_limited";

export interface FileProgress {
  name: string;
  size: number;
  progress: number; // 0-100
  status: UploadStatus;
}
