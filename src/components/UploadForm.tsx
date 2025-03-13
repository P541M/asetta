// components/UploadForm.tsx
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

interface UploadFormProps {
  semester: string;
  onUploadSuccess: (semester: string) => void;
}

type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error";

interface FileProgress {
  name: string;
  size: number;
  progress: number; // 0-100
  status: UploadStatus;
}

const UploadForm = ({ semester, onUploadSuccess }: UploadFormProps) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [fileProgresses, setFileProgresses] = useState<FileProgress[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [overallProgress, setOverallProgress] = useState(0);
  const [message, setMessage] = useState({ text: "", type: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

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
        return "bg-indigo-600";
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div>
      <h2 className="text-xl font-medium mb-4">Upload Course Outlines</h2>
      <p className="text-gray-600 mb-6">
        Upload your course outline PDFs to automatically extract assignment
        details. Multiple files can be uploaded at once.
      </p>

      <form onSubmit={handleUpload}>
        {uploadStatus === "idle" && (
          <div
            className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-lg p-8 text-center mb-6 cursor-pointer hover:bg-gray-100 transition-colors"
            onDragOver={handleDragOver}
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
                  className="h-12 w-12 mx-auto text-gray-400"
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
                <p className="font-medium text-gray-700">
                  Drag and drop your PDFs here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  (Only PDF files are accepted)
                </p>
              </div>
            ) : (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 mx-auto text-indigo-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V8z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="font-medium text-indigo-700">
                  {files.length} file(s) selected
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-700 underline"
                >
                  Add more files
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFiles();
                  }}
                  className="ml-2 text-xs text-red-500 hover:text-red-600 underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {/* Overall Progress Bar (only visible during upload/processing) */}
        {(uploadStatus === "uploading" || uploadStatus === "processing") && (
          <div className="mb-6">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                Overall Progress
              </span>
              <span className="text-sm font-medium text-gray-700">
                {overallProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  uploadStatus === "uploading" ? "bg-blue-500" : "bg-indigo-600"
                }`}
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">
              {uploadStatus === "uploading"
                ? "Uploading files..."
                : "Processing PDFs and extracting data..."}
            </p>
          </div>
        )}

        {/* File List with Progress */}
        {files.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Files:</h3>
            <ul className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
              {fileProgresses.map((fileProgress, index) => (
                <li key={index} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center max-w-[70%]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0"
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
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {fileProgress.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(fileProgress.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>

                    {fileProgress.status === "idle" ? (
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
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
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          fileProgress.status === "success"
                            ? "bg-green-100 text-green-800"
                            : fileProgress.status === "error"
                            ? "bg-red-100 text-red-800"
                            : fileProgress.status === "processing"
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {getStatusText(fileProgress.status)}
                      </span>
                    )}
                  </div>

                  {/* File-specific progress bar */}
                  {fileProgress.status !== "idle" && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${getStatusColor(
                          fileProgress.status
                        )}`}
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
            className={`btn-primary px-6 py-2.5 ${
              files.length === 0 || uploadStatus !== "idle"
                ? "bg-gray-300 cursor-not-allowed text-gray-600"
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
              `Upload and Process ${
                files.length > 0
                  ? `(${files.length} file${files.length > 1 ? "s" : ""})`
                  : ""
              }`
            )}
          </button>
        </div>

        {message.text && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
              message.type === "error"
                ? "bg-red-50 text-red-700 border border-red-100"
                : "bg-emerald-50 text-emerald-700 border border-emerald-100"
            }`}
          >
            {message.type === "error" ? (
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 mr-2 mt-0.5 text-red-500 flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{message.text}</span>
              </div>
            ) : (
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 mr-2 mt-0.5 text-emerald-500 flex-shrink-0"
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
