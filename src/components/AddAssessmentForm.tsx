// components/AddAssessmentForm.tsx
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import { addDoc, collection } from "firebase/firestore";

interface AddAssessmentFormProps {
  semester: string;
  semesterId: string;
  onSuccess: () => void;
}

const AddAssessmentForm = ({
  semester,
  semesterId,
  onSuccess,
}: AddAssessmentFormProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    courseName: "",
    assignmentName: "",
    dueDate: new Date().toISOString().split("T")[0],
    weight: 0,
    status: "Not started",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "weight" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setMessage({
        text: "You must be logged in to add assessments",
        type: "error",
      });
      return;
    }

    // Validate the form
    if (!formData.courseName.trim()) {
      setMessage({ text: "Course name is required", type: "error" });
      return;
    }
    if (!formData.assignmentName.trim()) {
      setMessage({ text: "Assessment name is required", type: "error" });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      // Add the assessment to Firestore
      await addDoc(
        collection(
          db,
          "users",
          user.uid,
          "semesters",
          semesterId,
          "assessments"
        ),
        {
          ...formData,
          createdAt: new Date(),
        }
      );

      // Reset the form
      setFormData({
        courseName: "",
        assignmentName: "",
        dueDate: new Date().toISOString().split("T")[0],
        weight: 0,
        status: "Not started",
      });

      setMessage({
        text: "Assessment added successfully!",
        type: "success",
      });

      // Call the onSuccess callback
      onSuccess();
    } catch (error) {
      console.error("Error adding assessment:", error);
      setMessage({
        text: "Failed to add assessment. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-md">
      <h2 className="text-lg font-bold mb-2">Add Assessment Manually</h2>
      <p className="mb-4 text-sm text-gray-600">
        Add exams, assignments, and other assessments to your semester tracker
      </p>

      <div className="mb-3">
        <label
          htmlFor="courseName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Course Name/Code
        </label>
        <input
          type="text"
          id="courseName"
          name="courseName"
          value={formData.courseName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="e.g., CS101"
          required
        />
      </div>

      <div className="mb-3">
        <label
          htmlFor="assignmentName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Assessment Name
        </label>
        <input
          type="text"
          id="assignmentName"
          name="assignmentName"
          value={formData.assignmentName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="e.g., Midterm Exam"
          required
        />
      </div>

      <div className="mb-3">
        <label
          htmlFor="dueDate"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Due Date
        </label>
        <input
          type="date"
          id="dueDate"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-3">
        <label
          htmlFor="weight"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Weight (%)
        </label>
        <input
          type="number"
          id="weight"
          name="weight"
          value={formData.weight}
          onChange={handleChange}
          min="0"
          max="100"
          step="0.1"
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-3">
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="Not started">Not started</option>
          <option value="In progress">In progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-2 rounded ${
          isSubmitting ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
        } text-white`}
      >
        {isSubmitting ? "Adding..." : "Add Assessment"}
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

export default AddAssessmentForm;
