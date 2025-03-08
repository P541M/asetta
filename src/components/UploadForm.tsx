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
    <form onSubmit={handleUpload} className="p-4 bg-white rounded shadow-md">
      <h2 className="text-lg font-bold mb-2">Upload Course Outline</h2>
      <p className="mb-4 text-sm text-gray-600">
        Upload your course outline PDF to automatically extract assignment
        details
      </p>

      <div className="border-2 border-dashed border-gray-300 p-4 rounded text-center mb-4">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer text-blue-500 hover:text-blue-700"
        >
          {file ? file.name : "Click to select a PDF file"}
        </label>

        {file && (
          <div className="mt-2 text-sm text-gray-600">
            {file.name} ({(file.size / 1024).toFixed(0)} KB)
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={uploading || !file}
        className={`w-full py-2 rounded ${
          !file
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
      >
        {uploading ? "Processing..." : "Upload and Process"}
      </button>

      {message.text && (
        <div
          className={`mt-3 p-2 rounded text-sm ${
            message.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message.text}
        </div>
      )}
    </form>
  );
};

export default UploadForm;
