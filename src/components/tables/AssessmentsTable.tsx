import React, { JSX } from "react";
import { useState, useEffect, useRef } from "react";
import { db } from "../../lib/firebase";
import {
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import RichTextEditor from "../editor/RichTextEditor";
import {
  getFromLocalStorage,
  setToLocalStorage,
} from "../../utils/localStorage";
import { formatLocalDateTime, getDaysUntil } from "../../utils/dateUtils";
import { Assessment } from "../../types/assessment";
import ConfirmationModal from "../common/ConfirmationModal";

interface AssessmentsTableProps {
  assessments: Assessment[];
  semesterId: string;
  onStatusChange?: (assessmentId: string, newStatus: string) => void;
}

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLink: (url: string, text: string) => void;
}

const LinkModal = ({ isOpen, onClose, onAddLink }: LinkModalProps) => {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (url) {
      onAddLink(url, text || url);
      setUrl("");
      setText("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleSubmit}
      title="Add Link"
      message={
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary"
            >
              URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border-primary shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
              required
            />
          </div>
          <div>
            <label
              htmlFor="text"
              className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary"
            >
              Link Text (optional)
            </label>
            <input
              type="text"
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Display text"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border-primary shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
            />
          </div>
        </form>
      }
      confirmText="Add Link"
      variant="primary"
      icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      }
    />
  );
};

const AssessmentsTable: React.FC<AssessmentsTableProps> = ({
  assessments,
  semesterId,
  onStatusChange,
}) => {
  const { user } = useAuth();
  const [sortKey, setSortKey] = useState<keyof Assessment>(() =>
    getFromLocalStorage<keyof Assessment>("assessmentSortKey", "dueDate")
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(() =>
    getFromLocalStorage<"asc" | "desc">("assessmentSortOrder", "asc")
  );
  const [filter, setFilter] = useState<string>(() =>
    getFromLocalStorage<string>("assessmentFilter", "all")
  );
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDaysTillDue, setShowDaysTillDue] = useState<boolean>(true);
  const [showWeight, setShowWeight] = useState<boolean>(true);
  const [showNotes, setShowNotes] = useState<boolean>(true);
  const [editFormData, setEditFormData] = useState<Assessment>({
    id: "",
    courseName: "",
    assignmentName: "",
    dueDate: "",
    dueTime: "23:59",
    status: "Not started",
    notes: "",
    weight: 0,
  });
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [notesInput, setNotesInput] = useState<string>("");
  const [showNotesModal, setShowNotesModal] = useState<string | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkCallback, setLinkCallback] = useState<
    ((url: string, text: string) => void) | null
  >(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] =
    useState<Assessment | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showBulkStatusUpdate, setShowBulkStatusUpdate] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Fetch user preferences
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return;
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setShowDaysTillDue(userData.showDaysTillDue ?? true);
          setShowWeight(userData.showWeight ?? true);
          setShowNotes(userData.showNotes ?? true);
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
      }
    };

    // Initial fetch
    fetchUserPreferences();

    // Add event listener for preference updates
    const handlePreferencesUpdate = (event: CustomEvent) => {
      if (event.detail) {
        if ("showDaysTillDue" in event.detail) {
          setShowDaysTillDue(event.detail.showDaysTillDue);
        }
        if ("showWeight" in event.detail) {
          setShowWeight(event.detail.showWeight);
        }
        if ("showNotes" in event.detail) {
          setShowNotes(event.detail.showNotes);
        }
      }
    };

    window.addEventListener(
      "userPreferencesUpdated",
      handlePreferencesUpdate as EventListener
    );

    // Cleanup
    return () => {
      window.removeEventListener(
        "userPreferencesUpdated",
        handlePreferencesUpdate as EventListener
      );
    };
  }, [user]);

  // Update localStorage when sort preferences change
  useEffect(() => {
    setToLocalStorage("assessmentSortKey", sortKey);
  }, [sortKey]);

  useEffect(() => {
    setToLocalStorage("assessmentSortOrder", sortOrder);
  }, [sortOrder]);

  useEffect(() => {
    setToLocalStorage("assessmentFilter", filter);
  }, [filter]);

  // Existing helper functions remain largely unchanged; updating only where necessary
  const formatDateTimeForDisplay = (
    dateStr: string,
    timeStr: string
  ): string => {
    return formatLocalDateTime(dateStr, timeStr);
  };

  const getDaysTillDue = (
    dueDate: string,
    dueTime: string,
    status: string
  ): number | null => {
    const completedStatuses = ["Submitted", "Under Review", "Completed"];
    if (completedStatuses.includes(status)) return null;

    return getDaysUntil(dueDate, dueTime);
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
    if (days <= 7)
      return (
        <span className="text-amber-600 font-medium">
          {days === 1 ? "Due tomorrow" : `Due in ${days} days`}
        </span>
      );
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
        showNotesModal &&
        event.target instanceof Node &&
        !document.getElementById(`notes-modal`)?.contains(event.target) &&
        !document.getElementById(`link-modal`)?.contains(event.target)
      ) {
        setShowNotesModal(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotesModal]);

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
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (valA != null && valB != null) {
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    }
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
    assessmentId: string,
    newStatus: string
  ) => {
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
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      if (onStatusChange) {
        onStatusChange(assessmentId, newStatus);
      }
    } catch (error) {
      console.error("Error updating assessment status:", error);
    }
  };

  const handleDeleteAssessment = async (assessment: Assessment) => {
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
      await deleteDoc(assessmentRef);
      if (onStatusChange) {
        onStatusChange(assessment.id, "Deleted");
      }
      setShowDeleteModal(false);
      setAssessmentToDelete(null);
    } catch (error) {
      console.error("Error deleting assessment:", error);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (!user || selectedRows.length === 0) return;

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
        await deleteDoc(assessmentRef);
      }
      setSelectedRows([]);
      setShowBulkDeleteModal(false);
      onStatusChange?.(selectedRows[0], "Deleted");
    } catch (error) {
      console.error("Error performing bulk delete:", error);
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
    if (!assessment.id) return;
    setEditingId(assessment.id);
    setEditFormData({
      ...assessment,
      notes: assessment.notes || "",
    });
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
    if (!user) return;
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
      onStatusChange?.(assessmentId, editFormData.status);
    } catch (error) {
      console.error("Error updating assessment:", error);
    }
  };

  const handleNotesClick = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setNotesInput(assessment.notes || "");
    setShowNotesModal(assessment.id || null);
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

      // Strip HTML tags and whitespace to check if content is truly empty
      const strippedContent = notesInput.replace(/<[^>]*>/g, "").trim();

      // If strippedContent is empty, remove the notes field
      const updateData =
        strippedContent === ""
          ? {
              updatedAt: new Date(),
              notes: null, // Set to null to remove the field
            }
          : {
              notes: notesInput,
              updatedAt: new Date(),
            };

      await updateDoc(assessmentRef, updateData);
      setSelectedAssessment(null);
      onStatusChange?.(selectedAssessment.id, selectedAssessment.status);
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const handleAddLink = (callback: (url: string, text: string) => void) => {
    setLinkCallback(() => callback);
    setShowLinkModal(true);
  };

  const handleLinkSubmit = (url: string, text: string) => {
    if (linkCallback) {
      linkCallback(url, text);
      setLinkCallback(null);
    }
  };

  const handleDropdownToggle = (id: string | null) => {
    setDropdownOpenId(id);
  };

  const handleDeleteClick = (assessment: Assessment) => {
    setAssessmentToDelete(assessment);
    setShowDeleteModal(true);
    handleDropdownToggle(null);
  };

  // Add new function for bulk status update
  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (!user || selectedRows.length === 0) return;

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
        await updateDoc(assessmentRef, {
          status: newStatus,
          updatedAt: serverTimestamp(),
        });
      }
      setSelectedRows([]);
      setShowBulkStatusUpdate(false);
      setSelectedStatus("");
      onStatusChange?.(selectedRows[0], newStatus);
    } catch (error) {
      console.error("Error performing bulk status update:", error);
    }
  };

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);
    setShowBulkStatusUpdate(true);
  };

  const handleCancelStatusUpdate = () => {
    setShowBulkStatusUpdate(false);
    setSelectedStatus("");
  };

  return (
    <div className="px-6 pt-6">
      <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
        <h2 className="text-xl font-medium text-gray-900 dark:text-dark-text-primary">
          Your Assessments
        </h2>
        {sortedAssessments.length > 0 && (
          <div className="flex space-x-2 items-center">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input bg-white dark:bg-dark-bg-tertiary max-w-xs py-1.5 px-3 text-sm transition-all duration-300 hover:shadow-sm dark:text-dark-text-primary dark:border-dark-border-primary"
            >
              <option value="all">All Tasks</option>
              <option value="not_submitted">Not Submitted</option>
              <option value="submitted">Submitted</option>
            </select>
          </div>
        )}
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedRows.length > 0 && (
        <div className="mb-4 p-3 bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm border border-gray-100 dark:border-dark-border-primary animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                {selectedRows.length}{" "}
                {selectedRows.length === 1 ? "item" : "items"} selected
              </span>
              <div className="flex items-center space-x-2">
                {!showBulkStatusUpdate ? (
                  <select
                    onChange={(e) => handleStatusSelect(e.target.value)}
                    className="input py-1.5 px-3 text-sm bg-white dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border-primary"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Update Status
                    </option>
                    <option value="Not started">Not Started</option>
                    <option value="In progress">In Progress</option>
                    <option value="Submitted">Submitted</option>
                  </select>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
                      Update to:{" "}
                      <span className="font-medium">{selectedStatus}</span>
                    </span>
                    <button
                      onClick={() => handleBulkStatusUpdate(selectedStatus)}
                      className="btn-primary py-1.5 px-3 text-sm"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={handleCancelStatusUpdate}
                      className="btn-outline py-1.5 px-3 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="btn-danger py-1.5 px-3 text-sm"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedRows([])}
                className="text-sm text-gray-500 dark:text-dark-text-tertiary hover:text-gray-700 dark:hover:text-dark-text-secondary"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {sortedAssessments.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-dark-text-tertiary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-dark-text-tertiary"
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
          <p className="text-lg font-medium mb-2 dark:text-dark-text-primary">
            No assessments found
          </p>
          <p className="dark:text-dark-text-secondary">
            Upload a course outline or add assessments manually to get started.
          </p>
        </div>
      ) : (
        <div className="table-container rounded-lg border border-gray-100 dark:border-dark-border-primary">
          <table className="data-table">
            <thead className="bg-gray-50 dark:bg-dark-bg-tertiary">
              <tr>
                <th className="w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.length === sortedAssessments.length &&
                      sortedAssessments.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 dark:border-dark-border-primary text-primary-500 dark:text-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400"
                  />
                </th>
                <th className="w-32 dark:text-dark-text-primary">Status</th>
                <th
                  onClick={() => handleSort("courseName")}
                  className="cursor-pointer w-48"
                >
                  <div className="flex items-center space-x-1 group">
                    <span className="group-hover:text-primary-500 dark:group-hover:text-primary-400 dark:text-dark-text-primary">
                      Course
                    </span>
                    {sortKey === "courseName" && (
                      <span className="text-primary-500 dark:text-primary-400">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("assignmentName")}
                  className="cursor-pointer w-56"
                >
                  <div className="flex items-center space-x-1 group">
                    <span className="group-hover:text-primary-500 dark:group-hover:text-primary-400 dark:text-dark-text-primary">
                      Task
                    </span>
                    {sortKey === "assignmentName" && (
                      <span className="text-primary-500 dark:text-primary-400">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("dueDate")}
                  className="cursor-pointer w-48"
                >
                  <div className="flex items-center space-x-1 group">
                    <span className="group-hover:text-primary-500 dark:group-hover:text-primary-400 dark:text-dark-text-primary">
                      Due Date & Time
                    </span>
                    {sortKey === "dueDate" && (
                      <span className="text-primary-500 dark:text-primary-400">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                {showDaysTillDue && (
                  <th className="w-32 dark:text-dark-text-primary">
                    Days Till Due
                  </th>
                )}
                {showWeight && (
                  <th
                    onClick={() => handleSort("weight")}
                    className="cursor-pointer w-24"
                  >
                    <div className="flex items-center space-x-1 group">
                      <span className="group-hover:text-primary-500 dark:group-hover:text-primary-400 dark:text-dark-text-primary">
                        Weight
                      </span>
                      {sortKey === "weight" && (
                        <span className="text-primary-500 dark:text-primary-400">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                )}
                {showNotes && (
                  <th className="w-24 dark:text-dark-text-primary">Notes</th>
                )}
                <th className="w-24 dark:text-dark-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAssessments.map((assessment, index) => {
                if (!assessment) return null;
                const daysTillDue = getDaysTillDue(
                  assessment.dueDate,
                  assessment.dueTime,
                  assessment.status
                );
                return editingId === assessment.id ? (
                  <tr
                    key={`editing-${assessment.id}`}
                    className="bg-blue-50/50 dark:bg-blue-900/20 animate-fade-in"
                  >
                    <td className="w-10"></td>
                    <td>
                      <select
                        name="status"
                        value={editFormData.status}
                        onChange={handleEditFormChange}
                        className="input py-1 px-2 text-sm transition-all duration-300 w-full dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border-primary"
                      >
                        <option value="Not started">Not Started</option>
                        <option value="In progress">In Progress</option>
                        <option value="Submitted">Submitted</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        name="courseName"
                        value={editFormData.courseName}
                        onChange={handleEditFormChange}
                        className="input py-1 px-2 text-sm w-full dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border-primary"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="assignmentName"
                        value={editFormData.assignmentName}
                        onChange={handleEditFormChange}
                        className="input py-1 px-2 text-sm w-full dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border-primary"
                      />
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <input
                          type="date"
                          name="dueDate"
                          value={editFormData.dueDate}
                          onChange={handleEditFormChange}
                          className="input py-1 px-2 text-sm w-2/3 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border-primary"
                        />
                        <input
                          type="time"
                          name="dueTime"
                          value={editFormData.dueTime}
                          onChange={handleEditFormChange}
                          className="input py-1 px-2 text-sm w-1/3 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border-primary"
                        />
                      </div>
                    </td>
                    <td>
                      <span className="text-gray-400 dark:text-dark-text-tertiary text-sm italic">
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
                        className="input py-1 px-2 text-sm w-full dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border-primary"
                      />
                    </td>
                    <td></td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSaveEdit(assessment.id!)}
                          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded"
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
                          className="text-gray-600 dark:text-dark-text-tertiary hover:text-gray-800 dark:hover:text-dark-text-secondary p-1.5 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary rounded"
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
                    key={assessment?.id || index}
                    className="transition-all duration-300 hover:bg-gray-50/80 dark:hover:bg-dark-bg-tertiary"
                  >
                    <td className="pl-4">
                      {assessment?.id && (
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(assessment.id)}
                          onChange={() => toggleRowSelection(assessment.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 rounded border-gray-300 dark:border-dark-border-primary text-primary-500 dark:text-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400"
                        />
                      )}
                    </td>
                    <td>
                      <select
                        value={assessment?.status || "Not started"}
                        onChange={(e) =>
                          assessment?.id &&
                          handleStatusChange(assessment.id, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="input py-1 px-2 text-sm transition-all duration-300 w-full dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border-primary"
                      >
                        <option value="Not started">Not Started</option>
                        <option value="In progress">In Progress</option>
                        <option value="Submitted">Submitted</option>
                      </select>
                    </td>
                    <td className="font-medium whitespace-nowrap dark:text-dark-text-primary">
                      {assessment?.courseName}
                    </td>
                    <td>
                      <div className="flex items-center">
                        <span
                          className="truncate max-w-[240px] dark:text-dark-text-primary"
                          title={assessment?.assignmentName}
                        >
                          {assessment?.assignmentName}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      <span
                        className={`${
                          assessment?.status === "Submitted"
                            ? "text-emerald-600 dark:text-emerald-400 font-medium"
                            : "dark:text-dark-text-primary"
                        }`}
                      >
                        {assessment?.dueDate &&
                          assessment?.dueTime &&
                          formatDateTimeForDisplay(
                            assessment.dueDate,
                            assessment.dueTime
                          )}
                      </span>
                    </td>
                    {showDaysTillDue && (
                      <td className="whitespace-nowrap">
                        {formatDaysTillDue(daysTillDue)}
                      </td>
                    )}
                    {showWeight && (
                      <td className="whitespace-nowrap">
                        {assessment?.weight ? (
                          <span className="font-medium dark:text-dark-text-primary">
                            {assessment.weight}%
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-dark-text-tertiary">
                            -
                          </span>
                        )}
                      </td>
                    )}
                    {showNotes && (
                      <td>
                        <button
                          onClick={() => handleNotesClick(assessment)}
                          className={`p-1.5 rounded ${
                            assessment?.notes && assessment.notes.trim() !== ""
                              ? "text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30"
                              : "text-gray-400 dark:text-dark-text-tertiary hover:text-gray-600 dark:hover:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
                          }`}
                          title={
                            assessment?.notes && assessment.notes.trim() !== ""
                              ? "Edit Notes"
                              : "Add Notes"
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path
                              fillRule="evenodd"
                              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </td>
                    )}
                    <td onClick={(e) => e.stopPropagation()}>
                      <div
                        className="relative inline-block"
                        ref={
                          dropdownOpenId === assessment?.id ? dropdownRef : null
                        }
                      >
                        <button
                          onClick={() =>
                            handleDropdownToggle(
                              dropdownOpenId === assessment?.id
                                ? null
                                : assessment?.id || null
                            )
                          }
                          className="text-gray-500 dark:text-dark-text-tertiary hover:text-gray-700 dark:hover:text-dark-text-secondary p-1.5 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-full"
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
                        {dropdownOpenId === assessment?.id && (
                          <div className="absolute right-0 z-10 mt-2 w-36 rounded-md bg-white dark:bg-dark-bg-secondary shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-dark-border">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  handleDropdownToggle(null);
                                  handleEditClick(assessment);
                                }}
                                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  handleDropdownToggle(null);
                                  handleDeleteClick(assessment);
                                }}
                                className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-2 text-red-500 dark:text-red-400"
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
      {showNotesModal && selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            id="notes-modal"
            className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg p-6 w-full max-w-4xl h-[90vh] flex flex-col animate-scale"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-dark-text-primary">
                  Notes for {selectedAssessment.assignmentName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                  {selectedAssessment.courseName}
                </p>
                <div className="mt-2 flex items-center space-x-4 text-sm">
                  <span className="text-gray-600 dark:text-dark-text-secondary">
                    Due:{" "}
                    {formatDateTimeForDisplay(
                      selectedAssessment.dueDate,
                      selectedAssessment.dueTime
                    )}
                  </span>
                  <span className="text-gray-600 dark:text-dark-text-secondary">
                    Weight: {selectedAssessment.weight}%
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedAssessment.status === "Submitted"
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400"
                        : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {selectedAssessment.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const text = `Assignment: ${
                      selectedAssessment.assignmentName
                    }\nCourse: ${
                      selectedAssessment.courseName
                    }\nDue: ${formatDateTimeForDisplay(
                      selectedAssessment.dueDate,
                      selectedAssessment.dueTime
                    )}\nWeight: ${selectedAssessment.weight}%\nStatus: ${
                      selectedAssessment.status
                    }\n\nNotes:\n${notesInput}`;
                    navigator.clipboard.writeText(text);
                  }}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-dark-border-primary shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-dark-text-primary bg-white dark:bg-dark-bg-tertiary hover:bg-gray-50 dark:hover:bg-dark-bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                  title="Copy Notes"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="9"
                      y="9"
                      width="13"
                      height="13"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copy
                </button>
                <button
                  onClick={() => {
                    setShowNotesModal(null);
                    setSelectedAssessment(null);
                  }}
                  className="inline-flex items-center p-1.5 border border-transparent rounded-md text-gray-400 dark:text-dark-text-tertiary hover:text-gray-500 dark:hover:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 mb-4 border rounded-lg overflow-hidden dark:border-dark-border-primary">
              <RichTextEditor
                content={notesInput}
                onChange={setNotesInput}
                onAddLink={handleAddLink}
                placeholder={`Add your notes here...

• Key concepts and definitions
• Important formulas
• Questions for class
• Resources to review
• Progress updates
• Feedback received`}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowNotesModal(null);
                  setSelectedAssessment(null);
                }}
                className="btn-outline py-1.5 px-4"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSaveNotes();
                  setShowNotesModal(null);
                }}
                className="btn-primary py-1.5 px-4"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Link Modal */}
      <LinkModal
        isOpen={showLinkModal}
        onClose={() => {
          setShowLinkModal(false);
          setLinkCallback(null);
        }}
        onAddLink={handleLinkSubmit}
      />
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setAssessmentToDelete(null);
        }}
        onConfirm={() =>
          assessmentToDelete && handleDeleteAssessment(assessmentToDelete)
        }
        title="Confirm Delete"
        message={`Are you sure you want to delete "${assessmentToDelete?.assignmentName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        }
      />
      {/* Bulk Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleConfirmBulkDelete}
        title="Confirm Bulk Delete"
        message={`Are you sure you want to delete ${
          selectedRows.length
        } selected assessment${
          selectedRows.length === 1 ? "" : "s"
        }? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        }
      />
    </div>
  );
};

export default AssessmentsTable;
