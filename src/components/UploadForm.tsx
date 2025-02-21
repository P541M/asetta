// components/UploadForm.tsx
import { useState } from "react";

interface UploadFormProps {
  semester: string;
  onUploadSuccess: (semester: string) => void;
}

const UploadForm = ({ semester, onUploadSuccess }: UploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage("");

    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append("file", file);
    formData.append("semester", semester);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setMessage("File processed successfully!");
        // Refresh the assessments for the semester
        onUploadSuccess(semester);
      } else {
        setMessage("Error processing file.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Upload failed.");
    }
    setUploading(false);
  };

  return (
    <form onSubmit={handleUpload} className="p-4 bg-white rounded shadow-md">
      <h2 className="text-lg font-bold mb-2">Upload Course Outline PDF</h2>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="mb-3"
      />
      <button
        type="submit"
        disabled={uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {message && <p className="mt-2">{message}</p>}
    </form>
  );
};

export default UploadForm;
