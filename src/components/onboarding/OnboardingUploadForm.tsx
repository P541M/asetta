import React, { useState, useRef, useCallback } from "react";
import {
  CircleAlert,
  CircleCheck,
  CircleX,
  CloudUpload,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { FileProgress, UploadStatus, ExtractionResult } from "../../types/upload";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import ApiLimitReachedModal from "../modals/ApiLimitReachedModal";
import CopyrightAgreement from "../forms/CopyrightAgreement";
import { postUploadForm } from "../../lib/uploadClient";

interface OnboardingUploadFormProps {
  semesterId: string;
  semesterName?: string;
  onUploadSuccess: (results: ExtractionResult) => void;
  showGuidance?: boolean;
}

export function OnboardingUploadForm({
  semesterId,
  onUploadSuccess,
  showGuidance = false,
}: OnboardingUploadFormProps) {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileProgress[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [copyrightAgreed, setCopyrightAgreed] = useState(false);
  const [showApiLimitModal, setShowApiLimitModal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FileProgress[] = Array.from(selectedFiles).map((file) => ({
      name: file.name,
      size: file.size,
      progress: 0,
      status: "idle" as UploadStatus,
    }));

    setFiles(newFiles);
    setError("");
    setMessage("");
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect],
  );

  const handleUpload = async () => {
    if (!user || !fileInputRef.current?.files?.length || !copyrightAgreed) return;

    try {
      setUploadStatus("uploading");
      setError("");
      setMessage("Preparing files for upload...");

      const formData = new FormData();
      formData.append("semesterId", semesterId);

      Array.from(fileInputRef.current.files).forEach((file, index) => {
        formData.append("files", file);
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index ? { ...f, status: "uploading" as UploadStatus, progress: 50 } : f,
          ),
        );
      });

      setMessage("Uploading files...");

      const response = await postUploadForm(user, formData);

      if (!response.ok) {
        const errorData = await response.json();
        // Handle daily quota exhaustion
        if (response.status === 429 && errorData.error === "DAILY_QUOTA_EXCEEDED") {
          setUploadStatus("daily_quota_exceeded");
          setShowApiLimitModal(true);
          setError(errorData.message || "Daily processing limit reached");
          return;
        }
        throw new Error(errorData.error || "Upload failed");
      }

      setUploadStatus("processing");
      setMessage("Processing files with AI...");

      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: "processing" as UploadStatus,
          progress: 75,
        })),
      );

      const result = await response.json();

      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: "success" as UploadStatus,
          progress: 100,
        })),
      );

      setUploadStatus("success");
      setMessage(
        `Successfully processed ${
          result.data?.processedFiles || result.processedFiles || 0
        } file(s)!`,
      );

      // The API response has data nested under 'data' property
      const extractionData = {
        processedFiles: result.data?.processedFiles || result.processedFiles || 0,
        totalAssessments: result.data?.totalAssessments || result.totalAssessments || 0,
        courseBreakdown: result.data?.courseBreakdown || result.courseBreakdown || [],
        failedFiles: result.data?.failedFiles || result.failedFiles || 0,
        processingTime: result.data?.processingTime || result.processingTime || 0,
      };

      onUploadSuccess(extractionData);
    } catch (err) {
      console.error("Upload error:", err);

      // Check for daily quota errors in catch block as well
      if (
        err instanceof Error &&
        (err.message.includes("DAILY_QUOTA_EXCEEDED") ||
          err.message.includes("daily limit") ||
          err.message.includes("quota exceeded"))
      ) {
        setUploadStatus("daily_quota_exceeded");
        setShowApiLimitModal(true);
        setError("Daily processing limit reached");
      } else {
        setUploadStatus("error");
        setError(err instanceof Error ? err.message : "Upload failed");
      }

      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: "error" as UploadStatus,
        })),
      );
    }
  };

  const resetUpload = () => {
    setFiles([]);
    setUploadStatus("idle");
    setMessage("");
    setError("");
    setShowApiLimitModal(false);
    setCopyrightAgreed(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCloseApiLimitModal = () => {
    setShowApiLimitModal(false);
  };

  const isBusy = uploadStatus === "uploading" || uploadStatus === "processing";

  return (
    <div className="w-full">
      {/* Guidance section */}
      {showGuidance && uploadStatus === "idle" && (
        <Alert className="mb-6">
          <Sparkles aria-hidden />
          <AlertTitle>What types of files work best?</AlertTitle>
          <AlertDescription>
            <ul className="mt-1 space-y-1 text-xs">
              <li>• Course syllabi with assignment schedules</li>
              <li>• Course outlines with assessment information</li>
              <li>• Assignment calendars or timetables</li>
              <li>• Any document containing due dates and weights</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Upload area */}
      <div
        className={cn(
          "relative rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          isDragOver ? "border-primary bg-primary/5" : "border-border bg-secondary/30",
          isBusy ? "cursor-not-allowed opacity-75" : "cursor-pointer",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={(e) => handleFileSelect(e.target.files)}
          aria-label="Upload course files"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          disabled={isBusy}
        />

        {files.length === 0 ? (
          <div>
            <div
              className={cn(
                "mx-auto mb-4 flex size-12 items-center justify-center rounded-full transition-colors",
                isDragOver ? "bg-primary/10" : "bg-secondary",
              )}
            >
              <CloudUpload
                className={cn(
                  "size-6 transition-colors",
                  isDragOver ? "text-primary" : "text-muted-foreground",
                )}
                aria-hidden
              />
            </div>
            <p className="text-base font-semibold text-foreground">Drop your course files here</p>
            <p className="mt-1 text-sm text-muted-foreground">or click to browse your computer</p>
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              Supports PDF, DOC, and DOCX files up to 10MB each
            </p>
          </div>
        ) : (
          <div>
            <h4 className="mb-3 text-base font-semibold text-foreground">
              Selected files ({files.length})
            </h4>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 rounded-xl bg-secondary/50 p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                    <div className="min-w-0 text-left">
                      <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                      <p className="text-xs font-medium text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {file.status === "uploading" || file.status === "processing" ? (
                      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden />
                        {file.progress}%
                      </span>
                    ) : file.status === "success" ? (
                      <CircleCheck className="size-5 text-success" aria-hidden />
                    ) : file.status === "error" ? (
                      <CircleX className="size-5 text-destructive" aria-hidden />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Copyright agreement */}
      {files.length > 0 && uploadStatus === "idle" && (
        <CopyrightAgreement
          id="copyright-agreement"
          checked={copyrightAgreed}
          onChange={setCopyrightAgreed}
          className="mt-4"
        />
      )}

      {/* Upload controls */}
      {files.length > 0 && uploadStatus === "idle" && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={resetUpload}
            className="text-muted-foreground"
          >
            Clear files
          </Button>
          <Button type="button" onClick={handleUpload} disabled={!copyrightAgreed}>
            <CloudUpload aria-hidden />
            Upload and process files
          </Button>
        </div>
      )}

      {/* Status messages */}
      {message && (
        <Alert className="mt-4">
          {isBusy ? (
            <Loader2 className="motion-safe:animate-spin" aria-hidden />
          ) : (
            <CircleCheck aria-hidden />
          )}
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <CircleAlert aria-hidden />
          <AlertDescription>
            {error}
            <div className="mt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetUpload}
                className="text-destructive"
              >
                Try again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Success state */}
      {uploadStatus === "success" && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-medium text-success">
            <CircleCheck className="size-4" aria-hidden />
            Files processed successfully
          </p>
          <Button type="button" variant="link" size="sm" onClick={resetUpload}>
            Upload more files
          </Button>
        </div>
      )}

      {/* API limit reached modal */}
      <ApiLimitReachedModal isOpen={showApiLimitModal} onClose={handleCloseApiLimitModal} />
    </div>
  );
}
