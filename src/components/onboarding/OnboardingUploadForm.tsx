import React, { useState, useRef, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  FileProgress,
  UploadStatus,
  ExtractionResult,
} from "../../types/upload";

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
    [handleFileSelect]
  );

  const handleUpload = async () => {
    if (!user || !fileInputRef.current?.files?.length || !copyrightAgreed)
      return;

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
            i === index
              ? { ...f, status: "uploading" as UploadStatus, progress: 50 }
              : f
          )
        );
      });

      setMessage("Uploading files...");

      const token = await user.getIdToken();
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      setUploadStatus("processing");
      setMessage("Processing files with AI...");

      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: "processing" as UploadStatus,
          progress: 75,
        }))
      );

      const result = await response.json();

      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: "success" as UploadStatus,
          progress: 100,
        }))
      );

      setUploadStatus("success");
      setMessage(
        `Successfully processed ${
          result.data?.processedFiles || result.processedFiles || 0
        } file(s)!`
      );

      // The API response has data nested under 'data' property
      const extractionData = {
        processedFiles:
          result.data?.processedFiles || result.processedFiles || 0,
        totalAssessments:
          result.data?.totalAssessments || result.totalAssessments || 0,
        courseBreakdown:
          result.data?.courseBreakdown || result.courseBreakdown || [],
        failedFiles: result.data?.failedFiles || result.failedFiles || 0,
        processingTime:
          result.data?.processingTime || result.processingTime || 0,
      };

      onUploadSuccess(extractionData);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed");

      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: "error" as UploadStatus,
        }))
      );
    }
  };

  const resetUpload = () => {
    setFiles([]);
    setUploadStatus("idle");
    setMessage("");
    setError("");
    setCopyrightAgreed(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      {/* Guidance Section */}
      {showGuidance && uploadStatus === "idle" && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2 text-sm">
            What types of files work best?
          </h4>
          <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
            <li>• Course syllabi with assignment schedules</li>
            <li>• Course outlines with assessment information</li>
            <li>• Assignment calendars or timetables</li>
            <li>• Any document containing due dates and weights</li>
          </ul>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragOver
            ? "border-light-button-primary dark:border-dark-button-primary bg-light-button-primary/5 dark:bg-dark-button-primary/5"
            : uploadStatus === "success"
            ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20"
            : uploadStatus === "error"
            ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
            : files.length > 0
            ? "border-light-button-primary dark:border-dark-button-primary bg-light-button-primary/5 dark:bg-dark-button-primary/5"
            : "border-light-border-secondary dark:border-dark-border-secondary hover:border-light-button-primary dark:hover:border-dark-button-primary hover:bg-light-button-primary/5 dark:hover:bg-dark-button-primary/5"
        }`}
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
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={
            uploadStatus === "uploading" || uploadStatus === "processing"
          }
        />

        {files.length === 0 ? (
          <div>
            <div className="w-12 h-12 bg-light-button-primary/10 dark:bg-dark-button-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-light-button-primary dark:text-dark-button-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-light-text-primary dark:text-dark-text-primary font-medium mb-2">
              Drop your course files here
            </p>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
              or click to browse your computer
            </p>
            <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
              Supports PDF, DOC, and DOCX files up to 10MB each
            </p>
          </div>
        ) : (
          <div>
            <h4 className="font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
              Selected Files ({files.length})
            </h4>
            <div className="space-y-2 mb-4">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg p-3"
                >
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                        {file.name}
                      </p>
                      <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.status === "uploading" ||
                    file.status === "processing" ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-light-button-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                          {file.progress}%
                        </span>
                      </div>
                    ) : file.status === "success" ? (
                      <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-green-600 dark:text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    ) : file.status === "error" ? (
                      <div className="w-5 h-5 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-red-600 dark:text-red-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Copyright Agreement */}
      {files.length > 0 && uploadStatus === "idle" && (
        <div className="mt-4 p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg border border-light-border-secondary dark:border-dark-border-secondary">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="copyright-agreement"
              checked={copyrightAgreed}
              onChange={(e) => setCopyrightAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 text-light-button-primary dark:text-dark-button-primary border-gray-300 rounded focus:ring-light-button-primary dark:focus:ring-dark-button-primary"
            />
            <label
              htmlFor="copyright-agreement"
              className="text-sm text-light-text-secondary dark:text-dark-text-secondary"
            >
              By uploading, I agree to the{" "}
              <a
                href="https://www.asetta.me/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-light-button-primary dark:text-dark-button-primary hover:underline"
              >
                Terms of Service
              </a>{" "}
              and confirm I have permission to upload these materials.
            </label>
          </div>
        </div>
      )}

      {/* Upload Controls */}
      {files.length > 0 && uploadStatus === "idle" && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={resetUpload}
            className="text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-secondary dark:hover:text-dark-text-secondary text-sm transition-colors"
          >
            Clear files
          </button>
          <button
            onClick={handleUpload}
            disabled={!copyrightAgreed}
            className={`btn-primary ${
              !copyrightAgreed ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Upload & Process Files
          </button>
        </div>
      )}

      {/* Status Messages */}
      {message && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">{message}</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-light-error-bg dark:bg-dark-error-bg border border-light-error-border dark:border-dark-error-border rounded-lg">
          <p className="text-sm text-light-error-text dark:text-dark-error-text">
            {error}
          </p>
          <button
            onClick={resetUpload}
            className="mt-2 text-xs text-light-button-primary dark:text-dark-button-primary hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Success State */}
      {uploadStatus === "success" && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-green-700 dark:text-green-400">
            ✓ Files processed successfully
          </div>
          <button
            onClick={resetUpload}
            className="text-sm text-light-button-primary dark:text-dark-button-primary hover:underline"
          >
            Upload more files
          </button>
        </div>
      )}
    </div>
  );
}
