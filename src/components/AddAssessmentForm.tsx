import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { localToUTC } from "../utils/dateUtils";

interface AddAssessmentFormProps {
  semesterId: string;
  onSuccess: () => void;
}

const AddAssessmentForm = ({
  semesterId,
  onSuccess,
}: AddAssessmentFormProps) => {
  const { user } = useAuth();

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
    dueTime: "23:59", // Default to 11:59 PM
    weight: 0,
    status: "Not started",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [formSuccess, setFormSuccess] = useState(false);
  const courseNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (courseNameRef.current) {
      courseNameRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (formSuccess) {
      const timer = setTimeout(() => setFormSuccess(false), 1000);
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
    if (!formData.courseName.trim()) {
      setMessage({ text: "Course name is required", type: "error" });
      courseNameRef.current?.focus();
      return;
    }
    if (!formData.assignmentName.trim()) {
      setMessage({ text: "Assessment name is required", type: "error" });
      return;
    }
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });
    try {
      // Convert local date/time to UTC for storage
      const { date: utcDate, time: utcTime } = localToUTC(
        formData.dueDate,
        formData.dueTime
      );

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
          dueDate: utcDate,
          dueTime: utcTime,
          createdAt: new Date(),
        }
      );
      setFormSuccess(true);
      setFormData({
        courseName: "",
        assignmentName: "",
        dueDate: getTodayDateString(),
        dueTime: "23:59", // Reset to default
        weight: 0,
        status: "Not started",
      });
      setMessage({ text: "Assessment added successfully!", type: "success" });
      onSuccess();
      courseNameRef.current?.focus();
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
    <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm border border-gray-100 dark:border-dark-border-primary p-6">
      <div
        className={`transition-all duration-300 ${
          formSuccess ? "form-success" : ""
        }`}
      >
        <h2 className="text-xl font-medium mb-6 dark:text-dark-text-primary">
          Add Assessment Manually
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label
                htmlFor="courseName"
                className="form-label dark:text-dark-text-primary"
              >
                Course Name/Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="courseName"
                name="courseName"
                value={formData.courseName}
                onChange={handleChange}
                ref={courseNameRef}
                className="input hover:shadow-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border"
                placeholder="e.g., CS101"
                required
              />
            </div>
            <div className="form-group">
              <label
                htmlFor="assignmentName"
                className="form-label dark:text-dark-text-primary"
              >
                Assessment Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="assignmentName"
                name="assignmentName"
                value={formData.assignmentName}
                onChange={handleChange}
                className="input hover:shadow-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border"
                placeholder="e.g., Midterm Exam"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label
                htmlFor="dueDate"
                className="form-label dark:text-dark-text-primary"
              >
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="input hover:shadow-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border"
                required
              />
            </div>
            <div className="form-group">
              <label
                htmlFor="dueTime"
                className="form-label dark:text-dark-text-primary"
              >
                Due Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="dueTime"
                name="dueTime"
                value={formData.dueTime}
                onChange={handleChange}
                className="input hover:shadow-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border"
                required
              />
            </div>
            <div className="form-group">
              <label
                htmlFor="weight"
                className="form-label dark:text-dark-text-primary"
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
                className="input hover:shadow-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group md:col-span-2">
              <label
                htmlFor="status"
                className="form-label dark:text-dark-text-primary"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input hover:shadow-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border"
              >
                <optgroup
                  label="Planning"
                  className="dark:bg-dark-bg-secondary dark:text-dark-text-primary"
                >
                  <option
                    value="Not started"
                    className="dark:bg-dark-bg-secondary dark:text-dark-text-primary"
                  >
                    Not started
                  </option>
                  <option
                    value="Draft"
                    className="dark:bg-dark-bg-secondary dark:text-dark-text-primary"
                  >
                    Draft
                  </option>
                </optgroup>
                <optgroup
                  label="Active Work"
                  className="dark:bg-dark-bg-secondary dark:text-dark-text-primary"
                >
                  <option
                    value="In progress"
                    className="dark:bg-dark-bg-secondary dark:text-dark-text-primary"
                  >
                    In progress
                  </option>
                  <option
                    value="On Hold"
                    className="dark:bg-dark-bg-secondary dark:text-dark-text-primary"
                  >
                    On Hold
                  </option>
                  <option
                    value="Needs Revision"
                    className="dark:bg-dark-bg-secondary dark:text-dark-text-primary"
                  >
                    Needs Revision
                  </option>
                </optgroup>
                <optgroup
                  label="Submission"
                  className="dark:bg-dark-bg-secondary dark:text-dark-text-primary"
                >
                  <option
                    value="Pending Submission"
                    className="dark:bg-dark-bg-secondary dark:text-dark-text-primary"
                  >
                    Pending Submission
                  </option>
                  <option
                    value="Submitted"
                    className="dark:bg-dark-bg-secondary dark:text-dark-text-primary"
                  >
                    Submitted
                  </option>
                  <option
                    value="Under Review"
                    className="dark:bg-dark-bg-secondary dark:text-dark-text-primary"
                  >
                    Under Review
                  </option>
                </optgroup>
                <optgroup
                  label="Other"
                  className="dark:bg-dark-bg-secondary dark:text-dark-text-primary"
                >
                  <option
                    value="Missed/Late"
                    className="dark:bg-dark-bg-secondary dark:text-dark-text-primary"
                  >
                    Missed/Late
                  </option>
                  <option
                    value="Deferred"
                    className="dark:bg-dark-bg-secondary dark:text-dark-text-primary"
                  >
                    Deferred
                  </option>
                </optgroup>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn-primary px-6 shadow hover:shadow-md transition-all duration-150 ${
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
                  ? "bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30 animate-fade-in"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30 animate-fade-in"
              }`}
            >
              {message.type === "error" ? (
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 mr-2 mt-0.5 text-red-500 dark:text-red-400"
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
                    className="h-5 w-5 mr-2 mt-0.5 text-emerald-500 dark:text-emerald-400"
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
    </div>
  );
};

export default AddAssessmentForm;
