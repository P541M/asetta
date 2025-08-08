import React from "react";
import { useState, useEffect, useRef } from "react";
import {
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAssessmentDocRef, getUserDocRef } from "../../lib/firebaseUtils";
import { useAuth } from "../../contexts/AuthContext";
import RichTextEditor from "../editor/RichTextEditor";
import {
  getFromLocalStorage,
  setToLocalStorage,
} from "../../utils/localStorage";
import { getStatusTextClasses, getStatusBadgeClasses } from "../../utils/statusUtils";
import { formatLocalDateTime, getDaysUntil } from "../../utils/dateUtils";
import { Assessment, AssessmentsTableProps } from "../../types/assessment";
import ConfirmationModal from "../common/ConfirmationModal";
import StatusSelect from "../ui/StatusSelect";
import CustomSelect, { type SelectOption } from "../ui/CustomSelect";

const filterOptions: SelectOption[] = [
  {
    value: "all",
    label: "All Tasks",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    colorClass: "text-light-text-primary dark:text-dark-text-primary",
  },
  {
    value: "not_submitted",
    label: "Not Submitted",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    colorClass: "text-amber-600 dark:text-amber-400",
  },
  {
    value: "submitted",
    label: "Submitted",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
    colorClass: "text-emerald-600 dark:text-emerald-400",
  },
];

const AssessmentsTable: React.FC<AssessmentsTableProps> = ({
  assessments,
  semesterId,
  onStatusChange,
}) => {
  const { user } = useAuth();
  const [localAssessments, setLocalAssessments] =
    useState<Assessment[]>(assessments);

  // Update local assessments when props change
  useEffect(() => {
    setLocalAssessments(assessments);
  }, [assessments]);
  const [sortKey] = useState<keyof Assessment>(() =>
    getFromLocalStorage<keyof Assessment>("assessmentSortKey", "dueDate")
  );
  const [sortOrder] = useState<"asc" | "desc">(() =>
    getFromLocalStorage<"asc" | "desc">("assessmentSortOrder", "asc")
  );
  const [filter, setFilter] = useState<string>(() =>
    getFromLocalStorage<string>("assessmentFilter", "all")
  );
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
        const userDocRef = getUserDocRef(user.uid);
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
    const completedStatuses = [
      "Submitted",
      "Under Review",
      "Completed",
      "Missed",
    ];
    if (completedStatuses.includes(status)) return null;

    return getDaysUntil(dueDate, dueTime);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (
          showNotesModal &&
          event.target instanceof Node &&
          !document.getElementById(`notes-modal`)?.contains(event.target) &&
          !document.getElementById(`link-modal`)?.contains(event.target)
        ) {
          setShowNotesModal(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotesModal]);

  const filteredAssessments = localAssessments.filter((assessment) => {
    if (filter === "all") return true;
    if (filter === "not_submitted") return !["Submitted", "Missed"].includes(assessment.status);
    if (filter === "submitted") return ["Submitted", "Missed"].includes(assessment.status);
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

  const handleStatusChange = async (
    assessmentId: string,
    newStatus: "Not started" | "In progress" | "Submitted" | "Missed"
  ) => {
    if (!user || !assessmentId) return;

    // Optimistic update: Update UI immediately
    setLocalAssessments((prev) =>
      prev.map((assessment) =>
        assessment.id === assessmentId
          ? { ...assessment, status: newStatus }
          : assessment
      )
    );

    try {
      const assessmentRef = getAssessmentDocRef(
        user.uid,
        semesterId,
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
      // Revert optimistic update on error
      setLocalAssessments(assessments);
    }
  };

  const handleDeleteAssessment = async (assessment: Assessment) => {
    if (!user || !assessment.id) return;

    try {
      const assessmentRef = getAssessmentDocRef(
        user.uid,
        semesterId,
        assessment.id
      );
      await deleteDoc(assessmentRef);
      // Remove from local state after successful deletion
      setLocalAssessments((prev) => prev.filter((a) => a.id !== assessment.id));
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
        const assessmentRef = getAssessmentDocRef(user.uid, semesterId, id);
        await deleteDoc(assessmentRef);
      }
      // Remove deleted assessments from local state
      setLocalAssessments((prev) =>
        prev.filter((a) => !selectedRows.includes(a.id || ""))
      );
      setSelectedRows([]);
      setShowBulkDeleteModal(false);
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
      const assessmentRef = getAssessmentDocRef(
        user.uid,
        semesterId,
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
      const assessmentRef = getAssessmentDocRef(
        user.uid,
        semesterId,
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
      if (selectedAssessment.id) {
        onStatusChange?.(selectedAssessment.id, selectedAssessment.status);
      }
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const handleAddLink = (callback: (url: string, text: string) => void) => {
    callback("", "");
  };

  const handleDeleteClick = (assessment: Assessment) => {
    setAssessmentToDelete(assessment);
    setShowDeleteModal(true);
  };

  // Add new function for bulk status update
  const handleBulkStatusUpdate = async (
    newStatus: "Not started" | "In progress" | "Submitted" | "Missed"
  ) => {
    if (!user || selectedRows.length === 0) return;

    try {
      for (const id of selectedRows) {
        const assessmentRef = getAssessmentDocRef(user.uid, semesterId, id);
        await updateDoc(assessmentRef, {
          status: newStatus,
          updatedAt: serverTimestamp(),
        });
      }
      // Update local state optimistically
      setLocalAssessments((prev) =>
        prev.map((assessment) =>
          selectedRows.includes(assessment.id || "")
            ? { ...assessment, status: newStatus }
            : assessment
        )
      );
      setSelectedRows([]);
      setShowBulkStatusUpdate(false);
      setSelectedStatus("");
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
    <div className="p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-medium text-light-text-primary dark:text-dark-text-primary">
            Your Assessments
          </h2>
          <div className="w-full sm:w-auto">
            <CustomSelect
              value={filter}
              onChange={setFilter}
              options={filterOptions}
              placeholder="Filter tasks"
              className="w-full sm:max-w-xs"
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedRows.length > 0 && (
        <div className="mb-4 p-4 bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm border border-gray-100 dark:border-dark-border-primary animate-fade-in">
          {/* Mobile Layout */}
          <div className="lg:hidden space-y-4">
            <div className="text-center">
              <span className="text-base font-medium text-gray-700 dark:text-dark-text-primary">
                {selectedRows.length}{" "}
                {selectedRows.length === 1 ? "item" : "items"} selected
              </span>
            </div>
            
            <div className="space-y-3">
              {!showBulkStatusUpdate ? (
                <div className="w-full">
                  <StatusSelect
                    value={null}
                    onChange={(value) => handleStatusSelect(value)}
                    size="md"
                    placeholder="Update Status"
                    className="w-full"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-center">
                    <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      Update to:{" "}
                      <span className="font-medium">{selectedStatus}</span>
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        handleBulkStatusUpdate(
                          selectedStatus as
                            | "Not started"
                            | "In progress"
                            | "Submitted"
                            | "Missed"
                        )
                      }
                      className="btn-primary flex-1 py-2.5 px-4 text-sm min-h-[44px]"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={handleCancelStatusUpdate}
                      className="btn-outline flex-1 py-2.5 px-4 text-sm min-h-[44px]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200 dark:border-dark-border-primary">
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="btn-danger py-2.5 px-4 text-sm w-full min-h-[44px]"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedRows([])}
                className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-secondary dark:hover:text-dark-text-secondary py-2 min-h-[44px]"
              >
                Clear Selection
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-md font-medium text-gray-700 dark:text-dark-text-primary">
                {selectedRows.length}{" "}
                {selectedRows.length === 1 ? "item" : "items"} selected
              </span>
              <div className="flex items-center space-x-2">
                {!showBulkStatusUpdate ? (
                  <div className="min-w-[140px]">
                    <StatusSelect
                      value={null}
                      onChange={(value) => handleStatusSelect(value)}
                      size="sm"
                      placeholder="Update Status"
                      className="text-sm"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      Update to:{" "}
                      <span className="font-medium">{selectedStatus}</span>
                    </span>
                    <button
                      onClick={() =>
                        handleBulkStatusUpdate(
                          selectedStatus as
                            | "Not started"
                            | "In progress"
                            | "Submitted"
                            | "Missed"
                        )
                      }
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
                className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-secondary dark:hover:text-dark-text-secondary"
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
          <p className="text-base font-medium mb-2 text-light-text-primary dark:text-dark-text-primary">
            No assessments found
          </p>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Upload a course outline or add assessments manually to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Headers - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:grid grid-cols-12 gap-2 px-4 py-3 bg-gray-100/50 dark:bg-dark-bg-tertiary/50 rounded-lg">
            <div className="col-span-2 flex items-center space-x-3">
              <input
                type="checkbox"
                checked={
                  selectedRows.length === sortedAssessments.length &&
                  sortedAssessments.length > 0
                }
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-gray-300 dark:border-dark-border-primary text-light-button-primary dark:text-dark-button-primary focus:ring-light-focus-ring dark:focus:ring-dark-focus-ring"
              />
              <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                Status
              </span>
            </div>
            <div className="col-span-2 flex items-center">
              <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                Course
              </span>
            </div>
            <div className="col-span-4 flex items-center">
              <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                Task
              </span>
            </div>
            <div className="col-span-4 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                Due Date
              </span>
              <div className="flex items-center space-x-4">
                {showWeight && (
                  <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                    Weight
                  </span>
                )}
                <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                  Actions
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Select All Header */}
          <div className="lg:hidden flex items-center justify-between p-3 bg-gray-100/50 dark:bg-dark-bg-tertiary/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={
                  selectedRows.length === sortedAssessments.length &&
                  sortedAssessments.length > 0
                }
                onChange={toggleSelectAll}
                className="h-5 w-5 rounded border-gray-300 dark:border-dark-border-primary text-light-button-primary dark:text-dark-button-primary focus:ring-light-focus-ring dark:focus:ring-dark-focus-ring"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                Select All ({sortedAssessments.length})
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-dark-text-tertiary">
              {selectedRows.length} selected
            </span>
          </div>

          {/* Assessment Cards */}
          <div className="space-y-2">
            {sortedAssessments.map((assessment) => {
              if (!assessment) return null;
              const daysTillDue = getDaysTillDue(
                assessment.dueDate,
                assessment.dueTime,
                assessment.status
              );
              return editingId === assessment.id ? (
                <div
                  key={`editing-${assessment.id}`}
                  className="bg-gray-50/50 dark:bg-dark-bg-tertiary/30 rounded-lg transition-all duration-300 p-4 animate-fade-in"
                >
                  {/* Mobile Edit Form */}
                  <div className="lg:hidden space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(assessment.id || "")}
                        onChange={() => toggleRowSelection(assessment.id || "")}
                        className="h-5 w-5 rounded border-gray-300 dark:border-dark-border-primary text-light-button-primary dark:text-dark-button-primary focus:ring-light-focus-ring dark:focus:ring-dark-focus-ring"
                      />
                      <div className="flex-1">
                        <StatusSelect
                          value={editFormData.status}
                          onChange={(value) => setEditFormData(prev => ({ ...prev, status: value }))}
                          size="md"
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                          Course
                        </label>
                        <input
                          type="text"
                          name="courseName"
                          value={editFormData.courseName}
                          onChange={handleEditFormChange}
                          placeholder="Course Name"
                          className="input py-3 px-4 text-base w-full dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border-primary rounded-md min-h-[44px]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                          Assignment
                        </label>
                        <input
                          type="text"
                          name="assignmentName"
                          value={editFormData.assignmentName}
                          onChange={handleEditFormChange}
                          placeholder="Assignment Name"
                          className="input py-3 px-4 text-base w-full dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border-primary rounded-md min-h-[44px]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                            Due Date
                          </label>
                          <input
                            type="date"
                            name="dueDate"
                            value={editFormData.dueDate}
                            onChange={handleEditFormChange}
                            className="input py-3 px-4 text-base w-full dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border-primary rounded-md min-h-[44px]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                            Due Time
                          </label>
                          <input
                            type="time"
                            name="dueTime"
                            value={editFormData.dueTime}
                            onChange={handleEditFormChange}
                            className="input py-3 px-4 text-base w-full dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border-primary rounded-md min-h-[44px]"
                          />
                        </div>
                      </div>

                      {showWeight && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                            Weight (%)
                          </label>
                          <input
                            type="number"
                            name="weight"
                            value={editFormData.weight}
                            onChange={handleEditFormChange}
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="Weight"
                            className="input py-3 px-4 text-base w-full dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border-primary rounded-md min-h-[44px]"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-2">
                      <button
                        onClick={handleCancelEdit}
                        className="btn-outline py-2.5 px-4 text-sm min-h-[44px] min-w-[80px]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          assessment.id && handleSaveEdit(assessment.id)
                        }
                        className="btn-primary py-2.5 px-4 text-sm min-h-[44px] min-w-[80px]"
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  {/* Desktop Edit Form */}
                  <div className="hidden lg:grid grid-cols-12 gap-2">
                    <div className="col-span-2 flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(assessment.id || "")}
                        onChange={() => toggleRowSelection(assessment.id || "")}
                        className="h-4 w-4 rounded border-gray-300 dark:border-dark-border-primary text-light-button-primary dark:text-dark-button-primary focus:ring-light-focus-ring dark:focus:ring-dark-focus-ring"
                      />
                      <StatusSelect
                        value={editFormData.status}
                        onChange={(value) => setEditFormData(prev => ({ ...prev, status: value }))}
                        size="sm"
                        className="flex-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        name="courseName"
                        value={editFormData.courseName}
                        onChange={handleEditFormChange}
                        placeholder="Course Name"
                        className="input py-1 px-2 text-md w-full dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border-primary rounded-md"
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        name="assignmentName"
                        value={editFormData.assignmentName}
                        onChange={handleEditFormChange}
                        placeholder="Assignment Name"
                        className="input py-1 px-2 text-md w-full dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border-primary rounded-md"
                      />
                    </div>
                    <div className="col-span-4 flex items-center space-x-2">
                      <input
                        type="date"
                        name="dueDate"
                        value={editFormData.dueDate}
                        onChange={handleEditFormChange}
                        className="input py-1 px-2 text-md flex-1 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border-primary rounded-md"
                      />
                      <input
                        type="time"
                        name="dueTime"
                        value={editFormData.dueTime}
                        onChange={handleEditFormChange}
                        className="input py-1 px-2 text-md w-24 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border-primary rounded-md"
                      />
                      {showWeight && (
                        <input
                          type="number"
                          name="weight"
                          value={editFormData.weight}
                          onChange={handleEditFormChange}
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="Weight"
                          className="input py-1 px-2 text-md w-20 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border-primary rounded-md"
                        />
                      )}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() =>
                            assessment.id && handleSaveEdit(assessment.id)
                          }
                          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-md transition-colors"
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
                          onClick={handleCancelEdit}
                          className="text-gray-600 dark:text-dark-text-tertiary hover:text-gray-800 dark:hover:text-dark-text-secondary p-1.5 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary rounded-md transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
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
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={assessment.id}
                  className="bg-gray-50/50 dark:bg-dark-bg-tertiary/30 rounded-lg transition-all duration-300 p-4"
                >
                  {/* Mobile Card Layout */}
                  <div className="lg:hidden space-y-4">
                    {/* Header with checkbox and status */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(assessment.id || "")}
                        onChange={() => toggleRowSelection(assessment.id || "")}
                        className="h-5 w-5 rounded border-gray-300 dark:border-dark-border-primary text-light-button-primary dark:text-dark-button-primary focus:ring-light-focus-ring dark:focus:ring-dark-focus-ring"
                      />
                      <div className="flex-1">
                        <StatusSelect
                          value={assessment.status}
                          onChange={(value) =>
                            assessment.id &&
                            handleStatusChange(assessment.id, value)
                          }
                          size="md"
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Course and Assignment Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary text-base">
                          {assessment.courseName}
                        </h3>
                        {showWeight && assessment.weight > 0 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-dark-bg-tertiary rounded-md text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                            {assessment.weight}%
                          </span>
                        )}
                      </div>
                      <p className="text-light-text-secondary dark:text-dark-text-secondary text-base font-medium leading-tight">
                        {assessment.assignmentName}
                      </p>
                    </div>

                    {/* Due Date Info */}
                    <div className="space-y-1">
                      <span
                        className={`text-sm font-medium ${getStatusTextClasses(assessment.status)}`}
                      >
                        Due: {formatDateTimeForDisplay(
                          assessment.dueDate,
                          assessment.dueTime
                        )}
                      </span>
                      {showDaysTillDue && daysTillDue !== null && (
                        <div
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            daysTillDue <= 3
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                              : daysTillDue <= 7
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400"
                          }`}
                        >
                          {daysTillDue === 0
                            ? "Due today"
                            : daysTillDue === 1
                            ? "Due tomorrow"
                            : `${daysTillDue} days left`}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-200 dark:border-dark-border-primary">
                      {showNotes && (
                        <button
                          onClick={() => handleNotesClick(assessment)}
                          className={`${
                            assessment.notes
                              ? "text-light-button-primary dark:text-dark-button-primary bg-blue-50 dark:bg-blue-900/30"
                              : "text-gray-500 dark:text-dark-text-tertiary"
                          } hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary p-3 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center`}
                          title={
                            assessment.notes
                              ? "View/Edit Notes"
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
                      )}
                      <button
                        onClick={() => handleEditClick(assessment)}
                        className="text-gray-500 dark:text-dark-text-tertiary hover:text-gray-700 dark:hover:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary p-3 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Edit Assessment"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(assessment)}
                        className="text-gray-500 dark:text-dark-text-tertiary hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 p-3 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Delete Assessment"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
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

                  {/* Desktop Table Layout */}
                  <div className="hidden lg:grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-2 flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(assessment.id || "")}
                        onChange={() => toggleRowSelection(assessment.id || "")}
                        className="h-4 w-4 rounded border-gray-300 dark:border-dark-border-primary text-light-button-primary dark:text-dark-button-primary focus:ring-light-focus-ring dark:focus:ring-dark-focus-ring"
                      />
                      <StatusSelect
                        value={assessment.status}
                        onChange={(value) =>
                          assessment.id &&
                          handleStatusChange(assessment.id, value)
                        }
                        size="sm"
                        className="flex-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary text-sm">
                        {assessment.courseName}
                      </h3>
                    </div>
                    <div className="col-span-4">
                      <p className="text-light-text-secondary dark:text-dark-text-secondary text-base">
                        {assessment.assignmentName}
                      </p>
                    </div>
                    <div className="col-span-4 flex items-center justify-between">
                      <div className="flex flex-col space-y-0.5">
                        <span
                          className={`text-md ${getStatusTextClasses(assessment.status)}`}
                        >
                          {formatDateTimeForDisplay(
                            assessment.dueDate,
                            assessment.dueTime
                          )}
                        </span>
                        {showDaysTillDue && daysTillDue !== null && (
                          <span
                            className={`text-xs ${
                              daysTillDue <= 3
                                ? "text-red-600 dark:text-red-400"
                                : daysTillDue <= 7
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-gray-500 dark:text-dark-text-tertiary"
                            }`}
                          >
                            {daysTillDue === 0
                              ? "Due today"
                              : daysTillDue === 1
                              ? "Due tomorrow"
                              : `${daysTillDue} days left`}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        {showWeight && assessment.weight > 0 && (
                          <span className="text-md font-medium text-gray-600 dark:text-dark-text-secondary">
                            {assessment.weight}%
                          </span>
                        )}
                        <div className="flex items-center space-x-1">
                          {showNotes && (
                            <button
                              onClick={() => handleNotesClick(assessment)}
                              className={`${
                                assessment.notes
                                  ? "text-light-button-primary dark:text-dark-button-primary"
                                  : "text-gray-500 dark:text-dark-text-tertiary"
                              } hover:text-gray-700 dark:hover:text-dark-text-secondary p-1 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-md transition-colors`}
                              title={
                                assessment.notes
                                  ? "View/Edit Notes"
                                  : "Add Notes"
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
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
                          )}
                          <button
                            onClick={() => handleEditClick(assessment)}
                            className="text-gray-500 dark:text-dark-text-tertiary hover:text-gray-700 dark:hover:text-dark-text-secondary p-1 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-md transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(assessment)}
                            className="text-gray-500 dark:text-dark-text-tertiary hover:text-red-600 dark:hover:text-red-400 p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Notes Modal */}
      {showNotesModal && selectedAssessment && (
        <div className="modal-backdrop">
          <div
            id="notes-modal"
            className="modal-container w-full max-w-4xl max-h-[90vh] flex flex-col"
          >
            <div className="modal-header">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-medium text-light-text-primary dark:text-dark-text-primary">
                    Notes for {selectedAssessment.assignmentName}
                  </h3>
                  <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary font-medium">
                    {selectedAssessment.courseName}
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    <span className="text-light-text-secondary dark:text-dark-text-secondary">
                      Due:{" "}
                      {formatDateTimeForDisplay(
                        selectedAssessment.dueDate,
                        selectedAssessment.dueTime
                      )}
                    </span>
                    <span className="text-light-text-secondary dark:text-dark-text-secondary">
                      Weight: {selectedAssessment.weight}%
                    </span>
                    <span
                      className={getStatusBadgeClasses(selectedAssessment.status)}
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
                    className="btn-outline px-3 py-1.5 text-sm"
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
                    className="inline-flex items-center p-1.5 border border-transparent rounded-md text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-secondary dark:hover:text-dark-text-secondary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary transition-colors"
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
            </div>
            <div className="modal-content flex-1 min-h-0 overflow-y-auto">
              <div className="border rounded-lg overflow-hidden border-light-border-primary dark:border-dark-border-primary">
                <RichTextEditor
                  content={notesInput}
                  onChange={setNotesInput}
                  onAddLink={handleAddLink}
                  placeholder={`Add your notes here...`}
                />
              </div>
            </div>
            <div className="modal-footer flex-none">
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
