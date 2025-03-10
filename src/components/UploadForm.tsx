// components/UploadForm.tsx
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface UploadFormProps {
  semester: string;
  onUploadSuccess: (semester: string) => void;
}

const UploadForm = ({ semester, onUploadSuccess }: UploadFormProps) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      // Only accept PDF files
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setMessage({
          text: "Please select a PDF file",
          type: "error",
        });
        return;
      }
      setFile(selectedFile);
      setMessage({ text: "", type: "" });
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) {
      setMessage({
        text: "Please select a file first",
        type: "error",
      });
      return;
    }
    setUploading(true);
    setMessage({ text: "", type: "" });
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append("file", file);
    formData.append("semester", semester);
    try {
      // Add the user's auth token to the request
      const idToken = await user.getIdToken();
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          // Include auth token in the header
          Authorization: `Bearer ${idToken}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setMessage({
          text: data.message || "File processed successfully!",
          type: "success",
        });
        // Reset file input
        setFile(null);
        if (e.target) {
          const form = e.target as HTMLFormElement;
          form.reset();
        }
        // Refresh the assessments for the semester
        onUploadSuccess(semester);
      } else {
        setMessage({
          text: data.error || "Error processing file.",
          type: "error",
        });
      }
    } catch (error) {
      console.error(error);
      setMessage({
        text: "Upload failed. Please try again.",
        type: "error",
      });
    }
    setUploading(false);
  };

  return (
    <div>
      <h2 className="text-xl font-medium mb-6">Upload Course Outline</h2>
      <p className="text-secondary-600 mb-6">
        Upload your course outline PDF to automatically extract assignment
        details
      </p>

      <form onSubmit={handleUpload}>
        <div className="border-2 border-dashed border-secondary-200 bg-secondary-50 rounded-lg p-8 text-center mb-6 cursor-pointer hover:bg-secondary-100 transition-colors">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            {file ? (
              <div className="space-y-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 mx-auto text-accent-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V8z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="font-medium text-primary-700">{file.name}</p>
                <p className="text-sm text-secondary-500">
                  {(file.size / 1024).toFixed(0)} KB
                </p>
                <p className="text-xs text-primary-600 mt-2">
                  Click to change file
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-secondary-400"
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
                <p className="font-medium text-secondary-700">
                  Drag and drop your PDF here, or click to browse
                </p>
                <p className="text-sm text-secondary-500">
                  (Only PDF files are accepted)
                </p>
              </div>
            )}
          </label>
        </div>

        <button
          type="submit"
          disabled={uploading || !file}
          className={`w-full ${
            !file
              ? "bg-secondary-300 cursor-not-allowed text-secondary-600"
              : uploading
              ? "bg-primary-400 cursor-wait text-white"
              : "btn-primary"
          }`}
        >
          {uploading ? (
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
            "Upload and Process"
          )}
        </button>

        {message.text && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
              message.type === "error"
                ? "bg-red-50 text-red-700 border border-red-100"
                : "bg-green-50 text-green-700 border border-green-100"
            }`}
          >
            {message.type === "error" ? (
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 mr-2 mt-0.5 text-red-500"
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
                  className="h-5 w-5 mr-2 mt-0.5 text-green-500"
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
