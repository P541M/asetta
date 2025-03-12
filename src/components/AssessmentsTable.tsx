// components/AssessmentsTable.tsx
import { useState, useEffect, useRef } from "react";
import { db } from "../lib/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
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
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Edit mode state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Assessment>({
    courseName: "",
    assignmentName: "",
    dueDate: "",
    weight: 0,
    status: "Not started",
  });

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

  const handleDeleteAssessment = async (assessment: Assessment) => {
    if (!user || !assessment.id) return;
    // Confirm deletion
    const confirm = window.confirm(
      `Are you sure you want to delete "${assessment.assignmentName}" for ${assessment.courseName}? This action cannot be undone.`
    );
    if (!confirm) return;
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
      await deleteDoc(assessmentRef);
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Error deleting assessment:", error);
    }
  };

  // Edit functions
  const handleEditClick = (assessment: Assessment) => {
    setEditingId(assessment.id!);
    setEditFormData({
      courseName: assessment.courseName,
      assignmentName: assessment.assignmentName,
      dueDate: assessment.dueDate,
      weight: assessment.weight,
      status: assessment.status,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === "weight" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSaveEdit = async (assessmentId: string) => {
    if (!user || !assessmentId) return;
    try {
      const assessmentRef = doc(
        db,
        "users",
        user.uid,
        "semesters",
        semesterId,
        "assessments",
        assessmentId
      );
      await updateDoc(assessmentRef, {
        ...editFormData,
        updatedAt: new Date(),
      });
      setEditingId(null);
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Error updating assessment:", error);
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
        <h2 className="text-xl font-medium text-gray-900">Your Assessments</h2>
        <div className="flex">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input bg-white max-w-xs py-1.5 px-3 text-sm"
          >
            <option value="all">All Tasks</option>
            <option value="incomplete">Incomplete</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      {sortedAssessments.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-4 text-gray-300"
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
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-24">Status</th>
                <th
                  onClick={() => handleSort("courseName")}
                  className="cursor-pointer"
                >
                  <div className="flex items-center space-x-1">
                    <span>Course</span>
                    {sortKey === "courseName" && (
                      <span className="text-indigo-600">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("assignmentName")}
                  className="cursor-pointer"
                >
                  <div className="flex items-center space-x-1">
                    <span>Task</span>
                    {sortKey === "assignmentName" && (
                      <span className="text-indigo-600">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("dueDate")}
                  className="cursor-pointer"
                >
                  <div className="flex items-center space-x-1">
                    <span>Due Date</span>
                    {sortKey === "dueDate" && (
                      <span className="text-indigo-600">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("weight")}
                  className="text-right cursor-pointer"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Weight</span>
                    {sortKey === "weight" && (
                      <span className="text-indigo-600">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAssessments.map((assessment, index) => {
                const dueDateStatus = getDueDateStatus(assessment.dueDate);
                return editingId === assessment.id ? (
                  // Editing mode row
                  <tr
                    key={`editing-${assessment.id}`}
                    className="bg-blue-50/50"
                  >
                    <td>
                      <select
                        name="status"
                        value={editFormData.status}
                        onChange={handleEditFormChange}
                        className="input py-1 px-2 text-sm"
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        name="courseName"
                        value={editFormData.courseName}
                        onChange={handleEditFormChange}
                        className="input py-1 px-2 text-sm w-full"
                        placeholder="Course Name"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="assignmentName"
                        value={editFormData.assignmentName}
                        onChange={handleEditFormChange}
                        className="input py-1 px-2 text-sm w-full"
                        placeholder="Assignment Name"
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        name="dueDate"
                        value={editFormData.dueDate}
                        onChange={handleEditFormChange}
                        className="input py-1 px-2 text-sm w-full"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        name="weight"
                        value={editFormData.weight}
                        onChange={handleEditFormChange}
                        min="0"
                        max="100"
                        step="0.1"
                        className="input py-1 px-2 text-sm w-full text-right"
                      />
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleSaveEdit(assessment.id!)}
                          className="text-emerald-600 hover:text-emerald-800 transition-colors"
                          title="Save"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-800 transition-colors"
                          title="Cancel"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  // Normal view row
                  <tr
                    key={assessment.id || index}
                    className={`transition-colors ${
                      assessment.status === "Completed"
                        ? "bg-emerald-50/40"
                        : dueDateStatus === "overdue"
                        ? "bg-red-50/40"
                        : dueDateStatus === "urgent"
                        ? "bg-amber-50/40"
                        : ""
                    }`}
                  >
                    <td>
                      <select
                        value={assessment.status}
                        onChange={(e) =>
                          handleStatusChange(assessment, e.target.value)
                        }
                        className={`input py-1 px-2 text-sm ${
                          assessment.status === "Completed"
                            ? "bg-emerald-100 border-emerald-200 text-emerald-800"
                            : assessment.status === "In progress"
                            ? "bg-blue-100 border-blue-200 text-blue-800"
                            : "bg-gray-100 border-gray-200 text-gray-800"
                        }`}
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="font-medium">{assessment.courseName}</td>
                    <td>{assessment.assignmentName}</td>
                    <td
                      className={`${
                        dueDateStatus === "overdue"
                          ? "text-red-600 font-medium"
                          : dueDateStatus === "urgent"
                          ? "text-amber-600 font-medium"
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
                    <td className="text-right">
                      {assessment.weight ? (
                        <span className="font-medium">
                          {assessment.weight}%
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="text-center">
                      <div
                        className="relative inline-block text-left"
                        ref={
                          dropdownOpenId === assessment.id ? dropdownRef : null
                        }
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Toggle dropdown menu
                            setDropdownOpenId(
                              dropdownOpenId === assessment.id
                                ? null
                                : assessment.id
                            );
                          }}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                          title="Options"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>

                        {dropdownOpenId === assessment.id && (
                          <div className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setDropdownOpenId(null);
                                  handleEditClick(assessment);
                                }}
                                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-2 text-blue-500"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setDropdownOpenId(null);
                                  handleDeleteAssessment(assessment);
                                }}
                                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-2 text-red-500"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
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
