import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { addDoc } from "firebase/firestore";
import { getAssessmentsRef } from "../../lib/firebaseUtils";
import { AddAssessmentFormProps } from "../../types/assessment";

const AddAssessmentForm = ({
  semester,
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
    if (!user) return;

    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const assessmentRef = getAssessmentsRef(user.uid, semesterId);

      await addDoc(assessmentRef, {
        ...formData,
        createdAt: new Date(),
      });

      setFormData({
        courseName: "",
        assignmentName: "",
        dueDate: getTodayDateString(),
        dueTime: "23:59",
        weight: 0,
        status: "Not started",
      });
      setFormSuccess(true);
      onSuccess?.();
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
    <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm border border-gray-200 dark:border-dark-border-primary p-6">
      <div
        className={`transition-all duration-300 ${
          formSuccess ? "form-success" : ""
        }`}
      >
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2">
            Quick Add Assessment
          </h3>
          <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
            Quickly add a single assessment for {semester} with all the essential details.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h4 className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">Basic Information</h4>
            </div>
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
                  className="input"
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
                  className="input"
                  placeholder="e.g., Midterm Exam"
                  required
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 14v-7m-2 7h4" />
              </svg>
              <h4 className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">Due Date & Details</h4>
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
                  className="input"
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
                  className="input"
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
                  className="input"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">Status</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label
                  htmlFor="status"
                  className="form-label dark:text-dark-text-primary"
                >
                  Current Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="Not started">Not Started</option>
                  <option value="In progress">In Progress</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Missed">Missed</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end pt-6 border-t border-gray-200 dark:border-dark-border-primary">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-light-button-primary text-white py-2.5 px-6 rounded-md hover:bg-light-button-primary-hover dark:bg-dark-button-primary dark:hover:bg-dark-button-primary-hover focus:outline-none focus:ring-2 focus:ring-light-focus-ring dark:focus:ring-dark-focus-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center ${
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
              className={`mt-4 p-4 rounded-lg text-sm animate-fade-in-up ${
                message.type === "error"
                  ? "bg-light-error-bg border border-light-error-bg text-light-error-text dark:bg-dark-error-bg dark:text-dark-error-text dark:border-dark-error-bg"
                  : "bg-light-success-bg border border-light-success-bg text-light-success-text dark:bg-dark-success-bg dark:text-dark-success-text dark:border-dark-success-bg"
              }`}
            >
              {message.type === "error" ? (
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 mr-3 mt-0.5 text-light-error-text dark:text-dark-error-text flex-shrink-0"
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
                  <span className="font-medium">{message.text}</span>
                </div>
              ) : (
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 mr-3 mt-0.5 text-light-success-text dark:text-dark-success-text flex-shrink-0"
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
                  <span className="font-medium">{message.text}</span>
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
