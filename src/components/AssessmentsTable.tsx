// components/AssessmentsTable.tsx
import { useState } from "react";
import { db } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

interface Assessment {
  id?: string;
  courseName: string;
  assignmentName: string;
  dueDate: string;
  weight: number;
  status: string;
}

interface AssessmentsTableProps {
  assessments: Assessment[];
  semesterId: string;
  onStatusChange?: () => void;
}

const AssessmentsTable = ({
  assessments,
  semesterId,
  onStatusChange,
}: AssessmentsTableProps) => {
  const { user } = useAuth();
  const [sortKey, setSortKey] = useState<keyof Assessment>("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filter, setFilter] = useState<string>("all");

  // Apply filters and sorting
  const filteredAssessments = assessments.filter((assessment) => {
    if (filter === "all") return true;
    if (filter === "incomplete") return assessment.status !== "Completed";
    if (filter === "completed") return assessment.status === "Completed";
    return true;
  });

  const sortedAssessments = [...filteredAssessments].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortOrder === "asc" ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key: keyof Assessment) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleStatusChange = async (
    assessment: Assessment,
    newStatus: string
  ) => {
    if (!user || !assessment.id) return;

    try {
      const assessmentRef = doc(
        db,
        "users",
        user.uid,
        "semesters",
        semesterId,
        "assessments",
        assessment.id
      );

      await updateDoc(assessmentRef, {
        status: newStatus,
        updatedAt: new Date(),
      });

      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Error updating assessment status:", error);
    }
  };

  // Calculate due date status
  const getDueDateStatus = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "overdue";
    if (diffDays <= 3) return "urgent";
    if (diffDays <= 7) return "upcoming";
    return "future";
  };

  // Status options
  const statusOptions = ["Not started", "In progress", "Completed"];

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Assessments</h2>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded p-1"
          >
            <option value="all">All Tasks</option>
            <option value="incomplete">Incomplete</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {sortedAssessments.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          No assessments found. Upload a course outline to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Status</th>
                <th
                  onClick={() => handleSort("courseName")}
                  className="cursor-pointer px-4 py-2 text-left"
                >
                  Course{" "}
                  {sortKey === "courseName" && (
                    <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
                <th
                  onClick={() => handleSort("assignmentName")}
                  className="cursor-pointer px-4 py-2 text-left"
                >
                  Task{" "}
                  {sortKey === "assignmentName" && (
                    <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
                <th
                  onClick={() => handleSort("dueDate")}
                  className="cursor-pointer px-4 py-2 text-left"
                >
                  Due Date{" "}
                  {sortKey === "dueDate" && (
                    <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
                <th
                  onClick={() => handleSort("weight")}
                  className="cursor-pointer px-4 py-2 text-right"
                >
                  Weight{" "}
                  {sortKey === "weight" && (
                    <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedAssessments.map((assessment, index) => {
                const dueDateStatus = getDueDateStatus(assessment.dueDate);
                return (
                  <tr
                    key={assessment.id || index}
                    className={`border-t ${
                      assessment.status === "Completed"
                        ? "bg-green-50"
                        : dueDateStatus === "overdue"
                        ? "bg-red-50"
                        : dueDateStatus === "urgent"
                        ? "bg-yellow-50"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-2">
                      <select
                        value={assessment.status}
                        onChange={(e) =>
                          handleStatusChange(assessment, e.target.value)
                        }
                        className={`border rounded p-1 ${
                          assessment.status === "Completed"
                            ? "bg-green-100 border-green-300"
                            : assessment.status === "In progress"
                            ? "bg-blue-100 border-blue-300"
                            : ""
                        }`}
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">{assessment.courseName}</td>
                    <td className="px-4 py-2">{assessment.assignmentName}</td>
                    <td
                      className={`px-4 py-2 ${
                        dueDateStatus === "overdue"
                          ? "text-red-600 font-medium"
                          : dueDateStatus === "urgent"
                          ? "text-yellow-600 font-medium"
                          : ""
                      }`}
                    >
                      {new Date(assessment.dueDate).toLocaleDateString()}
                      {dueDateStatus === "overdue" && " (Overdue)"}
                      {dueDateStatus === "urgent" && " (Due soon)"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {assessment.weight ? `${assessment.weight}%` : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssessmentsTable;
