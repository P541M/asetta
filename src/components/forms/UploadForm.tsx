import { useState, useRef, useCallback } from "react";
import {
  CircleAlert,
  CircleCheck,
  CloudUpload,
  FileText,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { UploadFormProps, UploadStatus, FileProgress, ExtractionResult } from "../../types/upload";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import RateLimitNotice from "../ui/RateLimitNotice";
import ExtractionSuccessModal from "../modals/ExtractionSuccessModal";
import ApiLimitReachedModal from "../modals/ApiLimitReachedModal";
import CopyrightAgreement from "./CopyrightAgreement";
import { postUploadForm } from "../../lib/uploadClient";

const UploadForm = ({ semesterId, semesterName, onUploadSuccess }: UploadFormProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileProgress[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [retryAfter, setRetryAfter] = useState<number>(120);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showApiLimitModal, setShowApiLimitModal] = useState<boolean>(false);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const [copyrightAgreed, setCopyrightAgreed] = useState<boolean>(false);

  const processFiles = useCallback((selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    // Filter for PDF files only
    const pdfFiles = selectedFiles.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length === 0) {
      setError("Please select PDF files only.");
      return;
    }

    const newFiles: FileProgress[] = pdfFiles.map((file) => ({
      name: file.name,
      size: file.size,
      progress: 0,
      status: "idle" as UploadStatus,
    }));

    setFiles(newFiles);
    setError("");
    setMessage("");

    // Update the file input to match
    if (fileInputRef.current) {
      const dt = new DataTransfer();
      pdfFiles.forEach((file) => dt.items.add(file));
      fileInputRef.current.files = dt.files;
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
  };

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragActive) setIsDragActive(true);
    },
    [isDragActive],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only set drag inactive if we're leaving the drop zone entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles);
    },
    [processFiles],
  );

  const handleUpload = async () => {
    if (!user || files.length === 0 || !copyrightAgreed) return;

    setUploadStatus("uploading");
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("semesterId", semesterId);

      // Add all files to form data
      if (fileInputRef.current?.files) {
        Array.from(fileInputRef.current.files).forEach((file, index) => {
          formData.append(`file-${index}`, file);
        });
      }

      const response = await postUploadForm(user, formData);

      const result = await response.json();

      if (result.success) {
        setUploadStatus("success");
        setMessage(result.message);
        setFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Show success modal with enhanced data
        if (result.data) {
          setExtractionResult(result.data);
          setShowSuccessModal(true);
        }

        onUploadSuccess(semesterName);
      } else {
        // Check for different types of errors
        if (response.status === 429) {
          if (result.error === "DAILY_QUOTA_EXCEEDED") {
            setUploadStatus("daily_quota_exceeded");
            setShowApiLimitModal(true);
            setError(result.message || "Daily processing limit reached");
          } else if (result.error === "RATE_LIMITED") {
            setUploadStatus("rate_limited");
            setRetryAfter(result.retryAfter || 120);
            setError(result.message || "Servers are busy. Please wait and try again.");
          } else {
            throw new Error(result.error || "Upload failed");
          }
        } else {
          throw new Error(result.error || "Upload failed");
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      // Check if it's a network-level error indicating quotas or rate limits
      if (
        err instanceof Error &&
        (err.message.includes("429") ||
          err.message.includes("rate limit") ||
          err.message.includes("quota"))
      ) {
        if (err.message.includes("daily") || err.message.includes("quota exceeded")) {
          setUploadStatus("daily_quota_exceeded");
          setShowApiLimitModal(true);
          setError("Daily processing limit reached");
        } else {
          setUploadStatus("rate_limited");
          setRetryAfter(120);
          setError("Servers are busy. Please wait and try again.");
        }
      } else {
        setUploadStatus("error");
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    }
  };

  const handleRetry = () => {
    setUploadStatus("idle");
    setError("");
    setMessage("");
    // Don't clear files on retry, user wants to retry the same files
    handleUpload();
  };

  const handleReset = () => {
    setFiles([]);
    setUploadStatus("idle");
    setMessage("");
    setError("");
    setRetryAfter(120);
    setShowSuccessModal(false);
    setShowApiLimitModal(false);
    setExtractionResult(null);
    setCopyrightAgreed(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setExtractionResult(null);
  };

  const handleCloseApiLimitModal = () => {
    setShowApiLimitModal(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Upload course outlines</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Transform your PDF course outlines into organized assessments automatically. Our AI
            extracts deadlines, requirements, and details in seconds.
          </p>
        </div>

        <Alert>
          <Sparkles aria-hidden />
          <AlertTitle>AI-powered extraction</AlertTitle>
          <AlertDescription>
            Please review extracted data for accuracy. Files are processed securely and never
            stored.
          </AlertDescription>
        </Alert>
      </div>

      <div className="space-y-6">
        {/* Drag and drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative rounded-xl border-2 border-dashed p-8 text-center transition-colors",
            isDragActive ? "border-primary bg-primary/5" : "border-border bg-secondary/30",
            uploadStatus === "uploading" ? "cursor-not-allowed opacity-75" : "cursor-pointer",
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="application/pdf"
            onChange={handleFileSelect}
            disabled={uploadStatus === "uploading"}
            aria-label="Upload PDF course outlines"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />

          <div className="space-y-4">
            <div
              className={cn(
                "mx-auto flex size-16 items-center justify-center rounded-full transition-colors",
                isDragActive ? "bg-primary/10" : "bg-secondary",
              )}
            >
              {uploadStatus === "uploading" ? (
                <Loader2 className="size-8 text-primary motion-safe:animate-spin" aria-hidden />
              ) : (
                <CloudUpload
                  className={cn(
                    "size-8 transition-colors",
                    isDragActive ? "text-primary" : "text-muted-foreground",
                  )}
                  aria-hidden
                />
              )}
            </div>

            <div>
              <h4
                className={cn(
                  "text-base font-semibold transition-colors",
                  isDragActive ? "text-primary" : "text-foreground",
                )}
              >
                {isDragActive ? "Drop your PDFs here" : "Drop PDFs or click to browse"}
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                {uploadStatus === "uploading"
                  ? "Processing your files..."
                  : "Supports multiple PDF files • Max 10MB per file"}
              </p>
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-foreground">Ready to process</h4>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {files.length} file{files.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid gap-3">
              {files.map((file, index) => (
                <div key={index} className="rounded-xl bg-secondary/50 p-4">
                  <div className="flex items-center gap-4">
                    <FileText className="size-8 shrink-0 text-muted-foreground" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                      <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                        {formatFileSize(file.size)} • PDF
                      </p>
                    </div>
                    <div className="shrink-0">
                      {uploadStatus === "uploading" ? (
                        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden />
                          Processing...
                        </span>
                      ) : (
                        <CircleCheck className="size-5 text-success" aria-hidden />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {message && !showSuccessModal && (
          <Alert variant="success">
            <CircleCheck aria-hidden />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {uploadStatus === "rate_limited" ? (
          <RateLimitNotice onRetry={handleRetry} retryAfter={retryAfter} autoRetry={true} />
        ) : (
          error && (
            <Alert variant="destructive">
              <CircleAlert aria-hidden />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )
        )}

        {/* Copyright agreement */}
        {files.length > 0 && uploadStatus === "idle" && (
          <CopyrightAgreement
            id="upload-copyright-agreement"
            checked={copyrightAgreed}
            onChange={setCopyrightAgreed}
          />
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            onClick={handleUpload}
            disabled={
              files.length === 0 ||
              uploadStatus === "uploading" ||
              uploadStatus === "rate_limited" ||
              uploadStatus === "daily_quota_exceeded" ||
              !user ||
              !copyrightAgreed
            }
            className="flex-1"
          >
            {uploadStatus === "uploading" ? (
              <>
                <Loader2 className="motion-safe:animate-spin" aria-hidden />
                Processing files...
              </>
            ) : (
              <>
                <Zap aria-hidden />
                Extract assessments
              </>
            )}
          </Button>

          {files.length > 0 && uploadStatus !== "uploading" && (
            <Button type="button" variant="secondary" onClick={handleReset}>
              {uploadStatus === "rate_limited" ? "Cancel and clear" : "Clear files"}
            </Button>
          )}
        </div>
      </div>

      {/* Success modal */}
      {showSuccessModal && extractionResult && (
        <ExtractionSuccessModal
          isOpen={showSuccessModal}
          onClose={handleCloseSuccessModal}
          result={extractionResult}
          semesterId={semesterId}
        />
      )}

      {/* API limit reached modal */}
      <ApiLimitReachedModal isOpen={showApiLimitModal} onClose={handleCloseApiLimitModal} />
    </div>
  );
};

export default UploadForm;
