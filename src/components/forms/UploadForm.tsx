import { useState, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { UploadFormProps, UploadStatus, FileProgress } from "../../types/upload";
import RateLimitNotice from "../ui/RateLimitNotice";

const UploadForm = ({ semester, onUploadSuccess }: UploadFormProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileProgress[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [retryAfter, setRetryAfter] = useState<number>(120);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newFiles: FileProgress[] = selectedFiles.map((file) => ({
      name: file.name,
      size: file.size,
      progress: 0,
      status: "idle" as UploadStatus,
    }));

    setFiles(newFiles);
    setError("");
    setMessage("");
  };

  const handleUpload = async () => {
    if (!user || files.length === 0) return;

    setUploadStatus("uploading");
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("semester", semester);

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
        onUploadSuccess(semester);
      } else {
        // Check if it's a rate limit error
        if (response.status === 429 || result.error === "RATE_LIMITED") {
          setUploadStatus("rate_limited");
          setRetryAfter(result.retryAfter || 120);
          setError(result.message || "Servers are busy. Please wait and try again.");
        } else {
          throw new Error(result.error || "Upload failed");
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      // Check if it's a network-level rate limit
      if (err instanceof Error && (err.message.includes('429') || err.message.includes('rate limit'))) {
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm border border-gray-200 dark:border-dark-border-primary p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2">
          Upload Course Outline
        </h3>
        <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-4">
          Upload PDF course outlines to automatically extract assessments. Files are processed using AI and then discarded - no outlines are stored.
        </p>
        
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg">
          <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
            AI Extraction Disclaimer
          </h4>
          <p className="text-sm text-amber-700 dark:text-amber-400">
            We use AI to extract assessment information from your course outlines. While we strive for accuracy, errors may occur. Please review your assessments table after upload to verify all extracted data is correct, and feel free to edit or delete any incorrect entries.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
            Select PDF Files
          </label>
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            multiple
            accept="application/pdf"
            onChange={handleFileSelect}
            disabled={uploadStatus === "uploading"}
            className="block w-full text-sm text-gray-500 dark:text-dark-text-secondary
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-light-button-secondary file:text-light-text-primary
              hover:file:bg-light-button-secondary-hover
              dark:file:bg-dark-button-secondary dark:file:text-dark-text-primary
              dark:hover:file:bg-dark-button-secondary-hover
              cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">
              Selected Files
            </h4>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg-tertiary rounded-md">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {uploadStatus === "uploading" && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-light-button-primary border-t-transparent dark:border-dark-button-primary dark:border-t-transparent"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {message && (
          <div className="p-4 bg-light-success-bg dark:bg-dark-success-bg rounded-md">
            <p className="text-sm text-light-success-text dark:text-dark-success-text">{message}</p>
          </div>
        )}

        {uploadStatus === "rate_limited" ? (
          <RateLimitNotice 
            onRetry={handleRetry}
            retryAfter={retryAfter}
            autoRetry={true}
          />
        ) : error && (
          <div className="p-4 bg-light-error-bg dark:bg-dark-error-bg rounded-md">
            <p className="text-sm text-light-error-text dark:text-dark-error-text">{error}</p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploadStatus === "uploading" || uploadStatus === "rate_limited" || !user}
            className="flex-1 bg-light-button-primary text-white py-2 px-4 rounded-md hover:bg-light-button-primary-hover dark:bg-dark-button-primary dark:hover:bg-dark-button-primary-hover focus:outline-none focus:ring-2 focus:ring-light-focus-ring dark:focus:ring-dark-focus-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploadStatus === "uploading" ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-light-button-primary border-t-transparent dark:border-dark-button-primary dark:border-t-transparent mr-2"></div>
                Processing...
              </div>
            ) : (
              "Extract Assessments"
            )}
          </button>
          
          {files.length > 0 && uploadStatus !== "uploading" && (
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-md text-sm font-medium text-gray-700 dark:text-dark-text-primary bg-white dark:bg-dark-bg-tertiary hover:bg-gray-50 dark:hover:bg-dark-bg-secondary focus:outline-none focus:ring-2 focus:ring-light-focus-ring dark:focus:ring-dark-focus-ring focus:ring-offset-2 transition-colors"
            >
              {uploadStatus === "rate_limited" ? "Cancel & Clear" : "Clear"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadForm;