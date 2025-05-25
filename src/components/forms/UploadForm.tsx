// components/UploadForm.tsx
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  UploadFormProps,
  UploadStatus,
  FileProgress,
} from "../../types/upload";

const UploadForm = ({ semester, onUploadSuccess }: UploadFormProps) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [fileProgresses, setFileProgresses] = useState<FileProgress[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [overallProgress, setOverallProgress] = useState(0);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update file progresses when files change
    const newProgresses = files.map((file) => ({
      name: file.name,
      size: file.size,
      progress: 0,
      status: "idle" as UploadStatus,
    }));
    setFileProgresses(newProgresses);
  }, [files]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: File[] = [];
      let hasError = false;
      // Check each file
      Array.from(e.target.files).forEach((file) => {
        if (file.type !== "application/pdf") {
          hasError = true;
          return;
        }
        newFiles.push(file);
      });
      if (hasError) {
        setMessage({
          text: "Only PDF files are accepted. Some files were not added.",
          type: "error",
        });
      } else {
        setMessage({ text: "", type: "" });
      }
      // Add to existing files
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setFileProgresses((prevProgresses) =>
      prevProgresses.filter((_, i) => i !== index)
    );
  };

  const updateFileProgress = (
    index: number,
    progress: number,
    status: UploadStatus
  ) => {
    setFileProgresses((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], progress, status };
      }
      return updated;
    });
    // Update overall progress
    const totalProgress = fileProgresses.reduce((sum, file, i) => {
      return sum + (i === index ? progress : file.progress);
    }, 0);
    setOverallProgress(Math.round(totalProgress / fileProgresses.length));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0 || !user) {
      setMessage({
        text: "Please select at least one file",
        type: "error",
      });
      return;
    }
    // Reset progress and set status to uploading
    setUploadStatus("uploading");
    setOverallProgress(0);
    fileProgresses.forEach((_, index) => {
      updateFileProgress(index, 0, "uploading");
    });
    setMessage({ text: "", type: "" });
    // Create FormData with all files
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });
    formData.append("semester", semester);
    formData.append("fileCount", files.length.toString());
    try {
      // Get user auth token
      const idToken = await user.getIdToken();
      // Simulate upload progress for better UX
      const uploadInterval = setInterval(() => {
        setFileProgresses((prev) => {
          const updated = [...prev];
          let totalProgress = 0;
          // Increment progress for each file that's still uploading
          updated.forEach((file, index) => {
            if (file.status === "uploading" && file.progress < 90) {
              const increment = Math.random() * 10;
              const newProgress = Math.min(90, file.progress + increment);
              updated[index] = { ...file, progress: newProgress };
            }
            totalProgress += updated[index].progress;
          });
          setOverallProgress(Math.round(totalProgress / updated.length));
          return updated;
        });
      }, 500);
      // Send the upload request
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        body: formData,
      });
      // Clear the upload progress interval
      clearInterval(uploadInterval);
      // Transition to processing state
      setUploadStatus("processing");
      fileProgresses.forEach((_, index) => {
        updateFileProgress(index, 95, "processing");
      });
      const data = await res.json();
      if (data.success) {
        // Mark all files as complete
        fileProgresses.forEach((_, index) => {
          updateFileProgress(index, 100, "success");
        });
        setOverallProgress(100);
        setUploadStatus("success");
        setMessage({
          text: data.message || "Files processed successfully!",
          type: "success",
        });
        // Reset file input for next upload
        setTimeout(() => {
          setFiles([]);
          setFileProgresses([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          // Refresh the assessments for the semester
          onUploadSuccess(semester);
        }, 2000); // Give user time to see success state
      } else {
        // Mark all files as error
        fileProgresses.forEach((_, index) => {
          updateFileProgress(index, 0, "error");
        });
        setUploadStatus("error");
        setMessage({
          text: data.error || "Error processing files.",
          type: "error",
        });
      }
    } catch (error) {
      console.error(error);
      setUploadStatus("error");
      // Mark all files as error
      fileProgresses.forEach((_, index) => {
        updateFileProgress(index, 0, "error");
      });
      setMessage({
        text: "Upload failed. Please try again.",
        type: "error",
      });
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Only set isDragging to false if we're leaving the dropzone (not an inner element)
    if (
      dropZoneRef.current &&
      !dropZoneRef.current.contains(e.relatedTarget as Node)
    ) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles: File[] = [];
      let hasError = false;
      Array.from(e.dataTransfer.files).forEach((file) => {
        if (file.type !== "application/pdf") {
          hasError = true;
          return;
        }
        newFiles.push(file);
      });
      if (hasError) {
        setMessage({
          text: "Only PDF files are accepted. Some files were not added.",
          type: "error",
        });
      } else if (newFiles.length > 0) {
        setMessage({ text: "", type: "" });
      }
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    setFileProgresses([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Status indicator helpers
  const getStatusText = (status: UploadStatus) => {
    switch (status) {
      case "uploading":
        return "Uploading...";
      case "processing":
        return "Processing...";
      case "success":
        return "Completed";
      case "error":
        return "Failed";
      default:
        return "";
    }
  };

  const getStatusColor = (status: UploadStatus) => {
    switch (status) {
      case "uploading":
        return "bg-blue-500";
      case "processing":
        return "bg-primary-600";
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm border border-gray-100 dark:border-dark-border-primary p-6">
      <h2 className="text-xl font-medium mb-4 dark:text-white">
        Upload Course Outlines
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Upload your course outline PDFs to automatically extract assignment
        details. Multiple files can be uploaded at once.
      </p>
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-amber-500 dark:text-amber-400 mr-2 mt-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
              AI Extraction Disclaimer
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              We use AI to extract assessment information from your course
              outlines. While we strive for accuracy, errors may occur. Please
              review your assessments table after upload to verify all extracted
              data is correct, and feel free to edit or delete any incorrect
              entries.
            </p>
          </div>
        </div>
      </div>
      <form onSubmit={handleUpload}>
        {uploadStatus === "idle" && (
          <div
            ref={dropZoneRef}
            className={`border-2 border-dashed ${
              isDragging
                ? "border-primary-400 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
            } rounded-lg p-8 text-center mb-6 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              multiple
            />
            {files.length === 0 ? (
              <div className="space-y-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 transition-transform duration-300 ${
                    isDragging
                      ? "scale-110 text-primary-400 dark:text-primary-400"
                      : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p
                  className={`font-medium ${
                    isDragging
                      ? "text-primary-700 dark:text-primary-300"
                      : "text-gray-700 dark:text-gray-300"
                  } transition-colors duration-300`}
                >
                  {isDragging
                    ? "Drop files here"
                    : "Drag and drop your PDFs here, or click to browse"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  (Only PDF files are accepted)
                </p>
              </div>
            ) : (
              <div
                className="space-y-2 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 mx-auto text-primary-500 dark:text-primary-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V8z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="font-medium text-primary-700 dark:text-primary-300">
                  {files.length} file(s) selected
                </p>
                <div className="flex justify-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm hover:shadow border border-primary-200 dark:border-primary-700"
                  >
                    Add more files
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFiles();
                    }}
                    className="text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors duration-200 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm hover:shadow border border-red-200 dark:border-red-700"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Overall Progress Bar (only visible during upload/processing) */}
        {(uploadStatus === "uploading" || uploadStatus === "processing") && (
          <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Overall Progress
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {overallProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full progress-bar ${
                  uploadStatus === "uploading"
                    ? "bg-blue-500 dark:bg-blue-400"
                    : "bg-primary-600 dark:bg-primary-400"
                }`}
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
              {uploadStatus === "uploading"
                ? "Uploading files..."
                : "Processing PDFs and extracting data..."}
            </p>
          </div>
        )}
        {/* File List with Progress */}
        {files.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Files:
            </h3>
            <ul className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700 shadow-sm">
              {fileProgresses.map((fileProgress, index) => (
                <li
                  key={index}
                  className="px-4 py-3 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center max-w-[70%]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="truncate">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {fileProgress.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(fileProgress.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>
                    {fileProgress.status === "idle" ? (
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                        title="Remove file"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    ) : (
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full transition-colors duration-200 ${
                          fileProgress.status === "success"
                            ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                            : fileProgress.status === "error"
                            ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
                            : fileProgress.status === "processing"
                            ? "bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300"
                            : "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
                        }`}
                      >
                        {getStatusText(fileProgress.status)}
                      </span>
                    )}
                  </div>
                  {/* File-specific progress bar */}
                  {fileProgress.status !== "idle" && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${getStatusColor(
                          fileProgress.status
                        )} ${
                          fileProgress.status === "uploading" ||
                          fileProgress.status === "processing"
                            ? "progress-bar"
                            : ""
                        }`}
                        style={{ width: `${fileProgress.progress}%` }}
                      ></div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={uploadStatus !== "idle" || files.length === 0}
            className={`btn-primary px-6 py-2.5 transition-all duration-300 shadow-sm hover:shadow hover:-translate-y-0.5 ${
              files.length === 0 || uploadStatus !== "idle"
                ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-600 dark:text-gray-400"
                : ""
            }`}
          >
            {uploadStatus === "uploading" ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </span>
            ) : uploadStatus === "processing" ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Upload and Process{" "}
                {files.length > 0
                  ? `(${files.length} file${files.length > 1 ? "s" : ""})`
                  : ""}
              </span>
            )}
          </button>
        </div>
        {message.text && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
              message.type === "error"
                ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-800 animate-fade-in"
                : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800 animate-fade-in"
            }`}
          >
            {message.type === "error" ? (
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 mr-2 mt-0.5 text-red-500 dark:text-red-400 flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{message.text}</span>
              </div>
            ) : (
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 mr-2 mt-0.5 text-emerald-500 dark:text-emerald-400 flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{message.text}</span>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default UploadForm;
