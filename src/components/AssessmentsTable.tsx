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
    <div>
      <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
        <h2 className="text-xl font-medium text-secondary-900">
          Your Assessments
        </h2>
        <div className="flex">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input bg-white max-w-xs"
          >
            <option value="all">All Tasks</option>
            <option value="incomplete">Incomplete</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {sortedAssessments.length === 0 ? (
        <div className="text-center py-10 text-secondary-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-4 text-secondary-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg font-medium mb-2">No assessments found</p>
          <p>
            Upload a course outline or add assessments manually to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="p-3 text-left w-24">Status</th>
                <th
                  onClick={() => handleSort("courseName")}
                  className="p-3 text-left cursor-pointer"
                >
                  <div className="flex items-center space-x-1">
                    <span>Course</span>
                    {sortKey === "courseName" && (
                      <span className="text-primary-600">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("assignmentName")}
                  className="p-3 text-left cursor-pointer"
                >
                  <div className="flex items-center space-x-1">
                    <span>Task</span>
                    {sortKey === "assignmentName" && (
                      <span className="text-primary-600">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("dueDate")}
                  className="p-3 text-left cursor-pointer"
                >
                  <div className="flex items-center space-x-1">
                    <span>Due Date</span>
                    {sortKey === "dueDate" && (
                      <span className="text-primary-600">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("weight")}
                  className="p-3 text-right cursor-pointer"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Weight</span>
                    {sortKey === "weight" && (
                      <span className="text-primary-600">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedAssessments.map((assessment, index) => {
                const dueDateStatus = getDueDateStatus(assessment.dueDate);
                return (
                  <tr
                    key={assessment.id || index}
                    className={`border-b border-secondary-100 hover:bg-secondary-50 transition-colors ${
                      assessment.status === "Completed"
                        ? "bg-green-50/40"
                        : dueDateStatus === "overdue"
                        ? "bg-red-50/40"
                        : dueDateStatus === "urgent"
                        ? "bg-yellow-50/40"
                        : ""
                    }`}
                  >
                    <td className="p-3">
                      <select
                        value={assessment.status}
                        onChange={(e) =>
                          handleStatusChange(assessment, e.target.value)
                        }
                        className={`input py-1 px-2 text-sm ${
                          assessment.status === "Completed"
                            ? "bg-green-100 border-green-200 text-green-800"
                            : assessment.status === "In progress"
                            ? "bg-blue-100 border-blue-200 text-blue-800"
                            : "bg-secondary-100 border-secondary-200 text-secondary-800"
                        }`}
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 font-medium">{assessment.courseName}</td>
                    <td className="p-3">{assessment.assignmentName}</td>
                    <td
                      className={`p-3 ${
                        dueDateStatus === "overdue"
                          ? "text-red-600 font-medium"
                          : dueDateStatus === "urgent"
                          ? "text-yellow-600 font-medium"
                          : ""
                      }`}
                    >
                      <div className="flex items-center">
                        {dueDateStatus === "overdue" && (
                          <span className="mr-2 badge-danger">Overdue</span>
                        )}
                        {dueDateStatus === "urgent" && (
                          <span className="mr-2 badge-warning">Due soon</span>
                        )}
                        {new Date(assessment.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      {assessment.weight ? (
                        <span className="font-medium">
                          {assessment.weight}%
                        </span>
                      ) : (
                        <span className="text-secondary-400">-</span>
                      )}
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
