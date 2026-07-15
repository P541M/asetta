import { useState, useEffect } from "react";
import { CircleAlert, CircleCheck, Loader2, Plus } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { addDoc } from "firebase/firestore";
import { getAssessmentsRef } from "../../lib/firebaseUtils";
import { AddAssessmentFormProps, AssessmentStatus } from "../../types/assessment";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import StatusSelect from "../tables/assessments/StatusSelect";

const AddAssessmentForm = ({ semesterId, onSuccess }: AddAssessmentFormProps) => {
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
    status: "Not started" as AssessmentStatus,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // One-shot success feedback clears itself; errors stay until the next attempt
  useEffect(() => {
    if (message.type === "success") {
      const timer = setTimeout(() => setMessage({ text: "", type: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setMessage({ text: "Assessment added", type: "success" });
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="courseName">
            Course name/code <span className="text-destructive">*</span>
          </Label>
          <Input
            type="text"
            id="courseName"
            name="courseName"
            value={formData.courseName}
            onChange={handleChange}
            placeholder="e.g., CS101"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="assignmentName">
            Assessment name <span className="text-destructive">*</span>
          </Label>
          <Input
            type="text"
            id="assignmentName"
            name="assignmentName"
            value={formData.assignmentName}
            onChange={handleChange}
            placeholder="e.g., Midterm exam"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="dueDate">
            Due date <span className="text-destructive">*</span>
          </Label>
          <Input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dueTime">
            Due time <span className="text-destructive">*</span>
          </Label>
          <Input
            type="time"
            id="dueTime"
            name="dueTime"
            value={formData.dueTime}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="weight">Weight (%)</Label>
          <Input
            type="number"
            id="weight"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            min="0"
            max="100"
            step="0.1"
            placeholder="Optional"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <StatusSelect
            value={formData.status}
            onChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
          />
        </div>
      </div>
      <div className="flex items-center justify-end pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="motion-safe:animate-spin" aria-hidden />
              Adding...
            </>
          ) : (
            <>
              <Plus aria-hidden />
              Add assessment
            </>
          )}
        </Button>
      </div>
      {message.text && (
        <Alert variant={message.type === "error" ? "destructive" : "success"}>
          {message.type === "error" ? <CircleAlert aria-hidden /> : <CircleCheck aria-hidden />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}
    </form>
  );
};

export default AddAssessmentForm;
