import { useState, useEffect, useRef } from "react";
import { db } from "../lib/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

interface Assessment {
  id?: string;
  courseName: string;
  assignmentName: string;
  dueDate: string;
  dueTime: string;
  weight: number;
  status: string;
  notes?: string;
  outlineUrl?: string; // Add outline URL
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
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [lastStatusChange, setLastStatusChange] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Assessment>({
    courseName: "",
    assignmentName: "",
    dueDate: "",
    dueTime: "23:59",
    weight: 0,
    status: "Not started",
    notes: "",
    outlineUrl: "",
  });
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [notesInput, setNotesInput] = useState<string>("");
  const [showOutline, setShowOutline] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Existing helper functions remain largely unchanged; updating only where necessary
  const formatDateTimeForDisplay = (
    dateStr: string,
    timeStr: string
  ): string => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date(year, month - 1, day, hours, minutes);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysTillDue = (
    dueDate: string,
    dueTime: string,
    status: string
  ): number | null => {
    const completedStatuses = ["Submitted", "Under Review", "Completed"];
    if (completedStatuses.includes(status)) return null;
    const now = new Date();
    const [year, month, day] = dueDate.split("-").map(Number);
    const [hours, minutes] = dueTime.split(":").map(Number);
    const due = new Date(year, month - 1, day, hours, minutes);
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDaysTillDue = (days: number | null): JSX.Element | null => {
    if (days === null) return null;
    if (days < 0)
      return (
        <span className="text-red-600 font-medium">
          {Math.abs(days)} {Math.abs(days) === 1 ? "day" : "days"} overdue
        </span>
      );
    if (days === 0)
      return <span className="text-red-600 font-bold">Due today</span>;
    if (days === 1)
      return <span className="text-amber-600 font-bold">Due tomorrow</span>;
    if (days <= 3)
      return (
        <span className="text-amber-600 font-medium">Due in {days} days</span>
      );
    if (days <= 7)
      return <span className="text-indigo-600">Due in {days} days</span>;
    return <span className="text-gray-600">Due in {days} days</span>;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpenId(null);
      }
      if (
        showOutline &&
        event.target instanceof Node &&
        !document
          .getElementById(`outline-modal-${showOutline}`)
          ?.contains(event.target)
      ) {
        setShowOutline(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showOutline]);

  const filteredAssessments = assessments.filter((assessment) => {
    if (filter === "all") return true;
    if (filter === "not_submitted") return assessment.status !== "Submitted";
    if (filter === "submitted") return assessment.status === "Submitted";
    return true;
  });

  const sortedAssessments = [...filteredAssessments].sort((a, b) => {
    if (sortKey === "dueDate") {
      const dateA = new Date(`${a.dueDate}T${a.dueTime}`);
      const dateB = new Date(`${b.dueDate}T${b.dueTime}`);
      return sortOrder === "asc"
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    }
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
      setLastStatusChange(assessment.id);
      setTimeout(() => setLastStatusChange(null), 1500);
      onStatusChange?.();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeleteAssessment = async (assessment: Assessment) => {
    if (!user || !assessment.id) return;
    if (
      !window.confirm(
        `Are you sure you want to delete "${assessment.assignmentName}" for ${assessment.courseName}?`
      )
    )
      return;
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
      onStatusChange?.();
    } catch (error) {
      console.error("Error deleting assessment:", error);
    }
  };

  const handleBulkAction = async (action: "complete" | "delete" | "reset") => {
    if (!user || selectedRows.length === 0) return;
    if (
      action === "delete" &&
      !window.confirm(
        `Are you sure you want to delete ${selectedRows.length} selected assessment(s)?`
      )
    )
      return;
    try {
      for (const id of selectedRows) {
        const assessmentRef = doc(
          db,
          "users",
          user.uid,
          "semesters",
          semesterId,
          "assessments",
          id
        );
        if (action === "delete") await deleteDoc(assessmentRef);
        else if (action === "complete")
          await updateDoc(assessmentRef, {
            status: "Submitted",
            updatedAt: new Date(),
          });
        else if (action === "reset")
          await updateDoc(assessmentRef, {
            status: "Not started",
            updatedAt: new Date(),
          });
      }
      setSelectedRows([]);
      onStatusChange?.();
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
    }
  };

  const toggleSelectAll = () => {
    setSelectedRows(
      selectedRows.length === sortedAssessments.length &&
        sortedAssessments.length > 0
        ? []
        : sortedAssessments.map((a) => a.id || "").filter(Boolean)
    );
  };

  const toggleRowSelection = (id: string) => {
    setSelectedRows(
      selectedRows.includes(id)
        ? selectedRows.filter((rowId) => rowId !== id)
        : [...selectedRows, id]
    );
  };

  const handleEditClick = (assessment: Assessment) => {
    setEditingId(assessment.id!);
    setEditFormData({ ...assessment });
  };

  const handleCancelEdit = () => setEditingId(null);

  const handleEditFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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
      onStatusChange?.();
    } catch (error) {
      console.error("Error updating assessment:", error);
    }
  };

  const getDueDateStatus = (
    dueDate: string,
    dueTime: string,
    status: string
  ) => {
    const completedStatuses = ["Submitted", "Under Review"];
    if (completedStatuses.includes(status)) return "future";
    const now = new Date();
    const [year, month, day] = dueDate.split("-").map(Number);
    const [hours, minutes] = dueTime.split(":").map(Number);
    const due = new Date(year, month - 1, day, hours, minutes);
    const diffDays = Math.ceil(
      (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0) return "overdue";
    if (diffDays <= 3) return "urgent";
    if (diffDays <= 7) return "upcoming";
    return "future";
  };

  const handleRowClick = (assessment: Assessment) => {
    if (!editingId && assessment.id) {
      setSelectedAssessment(assessment);
      setNotesInput(assessment.notes || "");
    }
  };

  const handleSaveNotes = async () => {
    if (!user || !selectedAssessment?.id) return;
    try {
      const assessmentRef = doc(
        db,
        "users",
        user.uid,
        "semesters",
        semesterId,
        "assessments",
        selectedAssessment.id
      );
      await updateDoc(assessmentRef, {
        notes: notesInput,
        updatedAt: new Date(),
      });
      setSelectedAssessment(null);
      onStatusChange?.();
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const handleViewOutline = (assessmentId: string) => {
    setShowOutline(assessmentId);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
        <h2 className="text-xl font-medium text-gray-900">Your Assessments</h2>
        <div className="flex space-x-2 items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input bg-white max-w-xs py-1.5 px-3 text-sm transition-all duration-300 hover:shadow-sm"
          >
            <option value="all">All Tasks</option>
            <option value="not_submitted">Not Submitted</option>
            <option value="submitted">Submitted</option>
          </select>
          {selectedRows.length > 0 && (
            <div className="flex items-center space-x-2 animate-fade-in">
              <span className="text-sm text-gray-600">
                {selectedRows.length} selected
              </span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleBulkAction("complete")}
                  className="p-1.5 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200"
                  title="Mark selected as submitted"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
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
                  onClick={() => handleBulkAction("reset")}
                  className="p-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                  title="Reset selected to 'Not started'"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="p-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                  title="Delete selected"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {sortedAssessments.length === 0 ? (
        <div className="text-center py-10 text-gray-500 animate-fade-in">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-4 text-gray-300 animate-bounce-light"
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
        <div className="table-container rounded-lg shadow-sm border border-gray-100">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.length === sortedAssessments.length &&
                      sortedAssessments.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="w-24">Status</th>
                <th
                  onClick={() => handleSort("courseName")}
                  className="cursor-pointer"
                >
                  <div className="flex items-center space-x-1 group">
                    <span className="group-hover:text-indigo-600">Course</span>
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
                  <div className="flex items-center space-x-1 group">
                    <span className="group-hover:text-indigo-600">Task</span>
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
                  <div className="flex items-center space-x-1 group">
                    <span className="group-hover:text-indigo-600">
                      Due Date & Time
                    </span>
                    {sortKey === "dueDate" && (
                      <span className="text-indigo-600">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="text-left">Days Till Due</th>
                <th
                  onClick={() => handleSort("weight")}
                  className="text-right cursor-pointer"
                >
                  <div className="flex items-center justify-end space-x-1 group">
                    <span className="group-hover:text-indigo-600">Weight</span>
                    {sortKey === "weight" && (
                      <span className="text-indigo-600">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="text-center">Outline</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAssessments.map((assessment, index) => {
                const dueDateStatus = getDueDateStatus(
                  assessment.dueDate,
                  assessment.dueTime,
                  assessment.status
                );
                const daysTillDue = getDaysTillDue(
                  assessment.dueDate,
                  assessment.dueTime,
                  assessment.status
                );
                return editingId === assessment.id ? (
                  <tr
                    key={`editing-${assessment.id}`}
                    className="bg-blue-50/50 animate-fade-in"
                  >
                    <td className="w-10"></td>
                    <td>
                      <select
                        name="status"
                        value={editFormData.status}
                        onChange={handleEditFormChange}
                        className={`input py-1 px-2 text-sm transition-all duration-300 w-full ${
                          editFormData.status === "Submitted"
                            ? "bg-emerald-100 border-emerald-200 text-emerald-800"
                            : editFormData.status === "In progress"
                            ? "bg-blue-100 border-blue-200 text-blue-800"
                            : editFormData.status === "Draft"
                            ? "bg-purple-100 border-purple-200 text-purple-800"
                            : editFormData.status === "Pending Submission"
                            ? "bg-orange-100 border-orange-200 text-orange-800"
                            : editFormData.status === "Under Review"
                            ? "bg-indigo-100 border-indigo-200 text-indigo-800"
                            : editFormData.status === "Needs Revision"
                            ? "bg-amber-100 border-amber-200 text-amber-800"
                            : editFormData.status === "Missed/Late"
                            ? "bg-red-100 border-red-200 text-red-800"
                            : editFormData.status === "On Hold"
                            ? "bg-yellow-100 border-yellow-200 text-yellow-800"
                            : "bg-gray-100 border-gray-200 text-gray-800"
                        }`}
                      >
                        <optgroup label="Planning">
                          <option value="Not started">Not started</option>
                          <option value="Draft">Draft</option>
                        </optgroup>
                        <optgroup label="Active Work">
                          <option value="In progress">In progress</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Needs Revision">Needs Revision</option>
                        </optgroup>
                        <optgroup label="Submission">
                          <option value="Pending Submission">Pending Submission</option>
                          <option value="Submitted">Submitted</option>
                          <option value="Under Review">Under Review</option>
                        </optgroup>
                        <optgroup label="Other">
                          <option value="Missed/Late">Missed/Late</option>
                          <option value="Deferred">Deferred</option>
                        </optgroup>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        name="courseName"
                        value={editFormData.courseName}
                        onChange={handleEditFormChange}
                        className="input py-1 px-2 text-sm w-full"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="assignmentName"
                        value={editFormData.assignmentName}
                        onChange={handleEditFormChange}
                        className="input py-1 px-2 text-sm w-full"
                      />
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <input
                          type="date"
                          name="dueDate"
                          value={editFormData.dueDate}
                          onChange={handleEditFormChange}
                          className="input py-1 px-2 text-sm w-2/3"
                        />
                        <input
                          type="time"
                          name="dueTime"
                          value={editFormData.dueTime}
                          onChange={handleEditFormChange}
                          className="input py-1 px-2 text-sm w-1/3"
                        />
                      </div>
                    </td>
                    <td>
                      <span className="text-gray-400 text-sm italic">
                        Will update on save
                      </span>
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
                    <td></td>
                    <td className="text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleSaveEdit(assessment.id!)}
                          className="text-emerald-600 hover:text-emerald-800 p-1.5 hover:bg-emerald-50 rounded"
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
                          className="text-gray-600 hover:text-gray-800 p-1.5 hover:bg-gray-50 rounded"
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
                  <tr
                    key={assessment.id || index}
                    onClick={() => handleRowClick(assessment)}
                    className={`transition-all duration-300 cursor-pointer ${
                      assessment.status === "Submitted"
                        ? "bg-emerald-50/40"
                        : assessment.status === "Missed/Late"
                        ? "bg-red-50/50"
                        : dueDateStatus === "overdue"
                        ? "bg-red-50/40"
                        : dueDateStatus === "urgent"
                        ? "bg-amber-50/40"
                        : ""
                    } ${
                      lastStatusChange === assessment.id ? "animate-pulse" : ""
                    } hover:bg-gray-50/80`}
                  >
                    <td className="pl-4">
                      {assessment.id && (
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(assessment.id)}
                          onChange={() => toggleRowSelection(assessment.id!)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      )}
                    </td>
                    <td className="w-40">
                      <select
                        value={assessment.status}
                        onChange={(e) =>
                          handleStatusChange(assessment, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className={`input py-1 px-2 text-sm transition-all duration-300 w-full ${
                          assessment.status === "Submitted"
                            ? "bg-emerald-100 border-emerald-200 text-emerald-800"
                            : assessment.status === "In progress"
                            ? "bg-blue-100 border-blue-200 text-blue-800"
                            : assessment.status === "Draft"
                            ? "bg-purple-100 border-purple-200 text-purple-800"
                            : assessment.status === "Pending Submission"
                            ? "bg-orange-100 border-orange-200 text-orange-800"
                            : assessment.status === "Under Review"
                            ? "bg-indigo-100 border-indigo-200 text-indigo-800"
                            : assessment.status === "Needs Revision"
                            ? "bg-amber-100 border-amber-200 text-amber-800"
                            : assessment.status === "Missed/Late"
                            ? "bg-red-100 border-red-200 text-red-800"
                            : assessment.status === "On Hold"
                            ? "bg-yellow-100 border-yellow-200 text-yellow-800"
                            : "bg-gray-100 border-gray-200 text-gray-800"
                        }`}
                      >
                        <optgroup label="Planning">
                          <option value="Not started">Not started</option>
                          <option value="Draft">Draft</option>
                        </optgroup>
                        <optgroup label="Active Work">
                          <option value="In progress">In progress</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Needs Revision">Needs Revision</option>
                        </optgroup>
                        <optgroup label="Submission">
                          <option value="Pending Submission">Pending Submission</option>
                          <option value="Submitted">Submitted</option>
                          <option value="Under Review">Under Review</option>
                        </optgroup>
                        <optgroup label="Other">
                          <option value="Missed/Late">Missed/Late</option>
                          <option value="Deferred">Deferred</option>
                        </optgroup>
                      </select>
                    </td>
                    <td className="font-medium">{assessment.courseName}</td>
                    <td>
                      <div className="flex items-center">
                        <span
                          className="truncate max-w-xs"
                          title={assessment.assignmentName}
                        >
                          {assessment.assignmentName}
                        </span>
                        {assessment.notes && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 ml-2 text-indigo-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M8 5a2 2 0 012-2h5a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h3zm0 2v8h7V5h-5v2H8z" />
                          </svg>
                        )}
                      </div>
                    </td>
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
                        {formatDateTimeForDisplay(
                          assessment.dueDate,
                          assessment.dueTime
                        )}
                      </div>
                    </td>
                    <td>{formatDaysTillDue(daysTillDue)}</td>
                    <td className="text-right">
                      {assessment.weight ? (
                        <span className="font-medium">
                          {assessment.weight}%
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td
                      className="text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {assessment.outlineUrl ? (
                        <button
                          onClick={() => handleViewOutline(assessment.id!)}
                          className="text-indigo-600 hover:text-indigo-800 p-1.5 hover:bg-indigo-50 rounded"
                          title="View Course Outline"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" />
                          </svg>
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td
                      className="text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        className="relative inline-block"
                        ref={
                          dropdownOpenId === assessment.id ? dropdownRef : null
                        }
                      >
                        <button
                          onClick={() =>
                            setDropdownOpenId(
                              dropdownOpenId === assessment.id
                                ? null
                                : assessment.id
                            )
                          }
                          className="text-gray-500 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-full"
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
                          <div className="absolute right-0 z-10 mt-2 w-36 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
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

      {/* Notes Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            id="notes-modal"
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-scale"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Notes for {selectedAssessment.assignmentName}
              </h3>
              <button
                onClick={() => setSelectedAssessment(null)}
                className="text-gray-400 hover:text-gray-600"
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
            <textarea
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              className="input w-full h-40 mb-4"
              placeholder="Add your notes here..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSelectedAssessment(null)}
                className="btn-outline py-1.5 px-4"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="btn-primary py-1.5 px-4"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outline Viewer Modal */}
      {showOutline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            id={`outline-modal-${showOutline}`}
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl h-[80vh] flex flex-col animate-scale"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Course Outline for{" "}
                {assessments.find((a) => a.id === showOutline)?.courseName}
              </h3>
              <button
                onClick={() => setShowOutline(null)}
                className="text-gray-400 hover:text-gray-600"
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
            <iframe
              src={assessments.find((a) => a.id === showOutline)?.outlineUrl}
              className="w-full flex-grow rounded-md border border-gray-200"
              title="Course Outline"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentsTable;
