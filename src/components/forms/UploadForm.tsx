import { useState, useRef, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  UploadFormProps,
  UploadStatus,
  FileProgress,
  ExtractionResult,
} from "../../types/upload";
import RateLimitNotice from "../ui/RateLimitNotice";
import ExtractionSuccessModal from "../modals/ExtractionSuccessModal";

const UploadForm = ({
  semesterId,
  semesterName,
  onUploadSuccess,
}: UploadFormProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileProgress[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [retryAfter, setRetryAfter] = useState<number>(120);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [extractionResult, setExtractionResult] =
    useState<ExtractionResult | null>(null);
  const [isDragActive, setIsDragActive] = useState<boolean>(false);

  const processFiles = useCallback((selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    // Filter for PDF files only
    const pdfFiles = selectedFiles.filter(
      (file) => file.type === "application/pdf"
    );

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
    [isDragActive]
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
    [processFiles]
  );

  const handleUpload = async () => {
    if (!user || files.length === 0) return;

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

      const token = await user.getIdToken();
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

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
        // Check if it's a rate limit error
        if (response.status === 429 || result.error === "RATE_LIMITED") {
          setUploadStatus("rate_limited");
          setRetryAfter(result.retryAfter || 120);
          setError(
            result.message || "Servers are busy. Please wait and try again."
          );
        } else {
          throw new Error(result.error || "Upload failed");
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      // Check if it's a network-level rate limit
      if (
        err instanceof Error &&
        (err.message.includes("429") || err.message.includes("rate limit"))
      ) {
        setUploadStatus("rate_limited");
        setRetryAfter(120);
        setError("Servers are busy. Please wait and try again.");
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
    setExtractionResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setExtractionResult(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="bg-light-bg-primary dark:bg-dark-bg-secondary rounded-xl border border-light-border-primary dark:border-dark-border-primary p-6 transition-all duration-200">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-light-button-primary dark:bg-dark-button-primary rounded-lg">
            <svg
              className="w-5 h-5 text-white"
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
          <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
            Upload Course Outlines
          </h3>
        </div>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4 leading-relaxed">
          Transform your PDF course outlines into organized assessments
          automatically. Our AI extracts deadlines, requirements, and details in
          seconds.
        </p>

        <div className="p-4 bg-light-warning-bg dark:bg-dark-warning-bg border border-light-warning-text/20 dark:border-dark-warning-text/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg
                className="w-5 h-5 text-light-warning-text dark:text-dark-warning-text"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-light-warning-text dark:text-dark-warning-text mb-1">
                AI-Powered Extraction
              </h4>
              <p className="text-sm text-light-warning-text dark:text-dark-warning-text">
                Please review extracted data for accuracy. Files are processed
                securely and never stored.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative cursor-pointer transition-all duration-200 ${
            isDragActive
              ? "border-light-button-primary dark:border-dark-button-primary bg-light-button-primary/5 dark:bg-dark-button-primary/10"
              : "border-light-border-secondary dark:border-dark-border-secondary hover:border-light-button-primary dark:hover:border-dark-button-primary"
          } ${
            uploadStatus === "uploading" ? "cursor-not-allowed opacity-75" : ""
          } border-2 border-dashed rounded-xl p-8 text-center bg-light-bg-tertiary dark:bg-dark-bg-tertiary`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="application/pdf"
            onChange={handleFileSelect}
            disabled={uploadStatus === "uploading"}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />

          <div className="space-y-4">
            <div
              className={`mx-auto flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 ${
                isDragActive
                  ? "bg-light-button-primary/20 dark:bg-dark-button-primary/20"
                  : "bg-light-bg-secondary dark:bg-dark-bg-secondary"
              }`}
            >
              {uploadStatus === "uploading" ? (
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-light-button-primary dark:border-dark-button-primary border-t-transparent"></div>
              ) : (
                <svg
                  className={`w-8 h-8 transition-colors duration-200 ${
                    isDragActive
                      ? "text-light-button-primary dark:text-dark-button-primary"
                      : "text-light-text-tertiary dark:text-dark-text-tertiary"
                  }`}
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
              )}
            </div>

            <div>
              <h4
                className={`text-lg font-semibold transition-colors duration-200 ${
                  isDragActive
                    ? "text-light-button-primary dark:text-dark-button-primary"
                    : "text-light-text-primary dark:text-dark-text-primary"
                }`}
              >
                {isDragActive
                  ? "Drop your PDFs here!"
                  : "Drop PDFs or click to browse"}
              </h4>
              <p
                className={`text-sm mt-2 transition-colors duration-200 ${
                  isDragActive
                    ? "text-light-button-primary dark:text-dark-button-primary"
                    : "text-light-text-secondary dark:text-dark-text-secondary"
                }`}
              >
                {uploadStatus === "uploading"
                  ? "Processing your files..."
                  : "Supports multiple PDF files • Max 10MB per file"}
              </p>
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                Ready to Process
              </h4>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-light-button-primary/10 text-light-button-primary dark:bg-dark-button-primary/20 dark:text-dark-button-primary">
                {files.length} file{files.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid gap-3">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="group relative bg-light-bg-primary dark:bg-dark-bg-tertiary rounded-lg border border-light-border-primary dark:border-dark-border-secondary p-4 transition-all duration-200 hover:shadow-md hover:border-light-button-primary dark:hover:border-dark-button-primary"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-light-error-bg dark:bg-dark-error-bg rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-light-error-text dark:text-dark-error-text"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary truncate group-hover:text-light-button-primary dark:group-hover:text-dark-button-primary transition-colors">
                        {file.name}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                          {formatFileSize(file.size)}
                        </span>
                        <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                          •
                        </span>
                        <span className="text-xs text-light-success-text dark:text-dark-success-text font-medium">
                          PDF Document
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {uploadStatus === "uploading" ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-light-button-primary dark:border-dark-button-primary border-t-transparent"></div>
                          <span className="text-xs text-light-button-primary dark:text-dark-button-primary font-medium">
                            Processing...
                          </span>
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-light-success-bg dark:bg-dark-success-bg rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-light-success-text dark:text-dark-success-text"
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
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {message && !showSuccessModal && (
          <div className="p-4 bg-light-success-bg dark:bg-dark-success-bg rounded-md">
            <p className="text-sm text-light-success-text dark:text-dark-success-text">
              {message}
            </p>
          </div>
        )}

        {uploadStatus === "rate_limited" ? (
          <RateLimitNotice
            onRetry={handleRetry}
            retryAfter={retryAfter}
            autoRetry={true}
          />
        ) : (
          error && (
            <div className="p-4 bg-light-error-bg dark:bg-dark-error-bg rounded-md">
              <p className="text-sm text-light-error-text dark:text-dark-error-text">
                {error}
              </p>
            </div>
          )
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleUpload}
            disabled={
              files.length === 0 ||
              uploadStatus === "uploading" ||
              uploadStatus === "rate_limited" ||
              !user
            }
            className="btn-primary flex-1 py-3 px-4 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadStatus === "uploading" ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Processing Your Files...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Extract Assessments</span>
              </>
            )}
          </button>

          {files.length > 0 && uploadStatus !== "uploading" && (
            <button onClick={handleReset} className="btn-secondary px-4 py-3">
              {uploadStatus === "rate_limited"
                ? "Cancel & Clear"
                : "Clear Files"}
            </button>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && extractionResult && (
        <ExtractionSuccessModal
          isOpen={showSuccessModal}
          onClose={handleCloseSuccessModal}
          result={extractionResult}
          semesterId={semesterId}
        />
      )}
    </div>
  );
};

export default UploadForm;
