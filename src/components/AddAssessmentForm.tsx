// components/AddAssessmentForm.tsx
import { useState, useEffect, useRef } from "react";
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

  // Helper function to get today's date as YYYY-MM-DD
  const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    courseName: "",
    assignmentName: "",
    dueDate: getTodayDateString(),
    weight: 0,
    status: "Not started",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [formSuccess, setFormSuccess] = useState(false);
  const courseNameRef = useRef<HTMLInputElement>(null);

  // Focus on the course name input when the form loads
  useEffect(() => {
    if (courseNameRef.current) {
      courseNameRef.current.focus();
    }
  }, []);

  // Clear form success state after animation completes
  useEffect(() => {
    if (formSuccess) {
      const timer = setTimeout(() => {
        setFormSuccess(false);
      }, 1000); // Match this with the animation duration
      return () => clearTimeout(timer);
    }
  }, [formSuccess]);

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
      if (courseNameRef.current) {
        courseNameRef.current.focus();
      }
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

      // Apply success animation
      setFormSuccess(true);

      // Reset the form
      setFormData({
        courseName: "",
        assignmentName: "",
        dueDate: getTodayDateString(),
        weight: 0,
        status: "Not started",
      });

      setMessage({
        text: "Assessment added successfully!",
        type: "success",
      });

      // Call the onSuccess callback
      onSuccess();

      // Focus back on the course name field for rapid entry
      if (courseNameRef.current) {
        courseNameRef.current.focus();
      }
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
    <div
      className={`transition-all duration-300 ${
        formSuccess ? "form-success" : ""
      }`}
    >
      <h2 className="text-xl font-medium mb-6">Add Assessment Manually</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="courseName" className="form-label">
              Course Name/Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="courseName"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              ref={courseNameRef}
              className="input hover:shadow-sm transition-all duration-200"
              placeholder="e.g., CS101"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="assignmentName" className="form-label">
              Assessment Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="assignmentName"
              name="assignmentName"
              value={formData.assignmentName}
              onChange={handleChange}
              className="input hover:shadow-sm transition-all duration-200"
              placeholder="e.g., Midterm Exam"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group">
            <label htmlFor="dueDate" className="form-label">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="input hover:shadow-sm transition-all duration-200"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="weight" className="form-label">
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
              className="input hover:shadow-sm transition-all duration-200"
            />
          </div>
          <div className="form-group">
            <label htmlFor="status" className="form-label">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input hover:shadow-sm transition-all duration-200"
            >
              <option value="Not started">Not started</option>
              <option value="In progress">In progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn-primary px-6 shadow hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
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
                Adding...
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
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Assessment
              </span>
            )}
          </button>
        </div>
        {message.text && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
              message.type === "error"
                ? "bg-red-50 text-red-700 border border-red-100 animate-fade-in"
                : "bg-emerald-50 text-emerald-700 border border-emerald-100 animate-fade-in"
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
                  className="h-5 w-5 mr-2 mt-0.5 text-emerald-500"
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

export default AddAssessmentForm;
