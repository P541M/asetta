/// <reference types="react" />
import React, { JSX } from 'react';
import { useState, useEffect, useRef } from "react";
import { db } from "../lib/firebase";
import { doc, updateDoc, deleteDoc, getDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import RichTextEditor from './RichTextEditor';
import { getFromLocalStorage, setToLocalStorage } from '../utils/localStorage';
import { utcToLocal, formatLocalDateTime, getDaysUntil } from '../utils/dateUtils';
import { Assessment } from '../types/assessment';

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

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  assessmentName: string;
}

interface BulkDeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
}

const LinkModal = ({ isOpen, onClose, onAddLink }: LinkModalProps) => {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      onAddLink(url, text || url);
      setUrl("");
      setText("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div id="link-modal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-scale">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Add Link</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700">
              Link Text (optional)
            </label>
            <input
              type="text"
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Display text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline py-1.5 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary py-1.5 px-4"
            >
              Add Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, assessmentName }: DeleteConfirmationModalProps) => {
  if (!isOpen) return null;

  const handleModalClick = (e: React.MouseEvent) => {
    // Prevent click from propagating to elements behind the modal
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] modal-open"
      onClick={handleModalClick}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-scale">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Confirm Delete</h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-500"
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
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{assessmentName}"? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="btn-outline py-1.5 px-4"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            className="btn-danger py-1.5 px-4"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const BulkDeleteConfirmationModal = ({ isOpen, onClose, onConfirm, count }: BulkDeleteConfirmationModalProps) => {
  if (!isOpen) return null;

  const handleModalClick = (e: React.MouseEvent) => {
    // Prevent click from propagating to elements behind the modal
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] modal-open"
      onClick={handleModalClick}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-scale">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Confirm Bulk Delete</h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-500"
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
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete {count} selected assessment{count === 1 ? '' : 's'}? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="btn-outline py-1.5 px-4"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            className="btn-danger py-1.5 px-4"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const AssessmentsTable: React.FC<AssessmentsTableProps> = ({
  assessments,
  semesterId,
  onStatusChange,
}) => {
  const { user } = useAuth();
  const [sortKey, setSortKey] = useState<keyof Assessment>(() => 
    getFromLocalStorage<keyof Assessment>('assessmentSortKey', 'dueDate')
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(() => 
    getFromLocalStorage<'asc' | 'desc'>('assessmentSortOrder', 'asc')
  );
  const [filter, setFilter] = useState<string>(() => 
    getFromLocalStorage<string>('assessmentFilter', 'all')
  );
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [lastStatusChange, setLastStatusChange] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDaysTillDue, setShowDaysTillDue] = useState<boolean>(true);
  const [showWeight, setShowWeight] = useState<boolean>(true);
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
  const [showNotes, setShowNotes] = useState<string | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkCallback, setLinkCallback] = useState<((url: string, text: string) => void) | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<Assessment | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

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
        if ('showDaysTillDue' in event.detail) {
          setShowDaysTillDue(event.detail.showDaysTillDue);
        }
        if ('showWeight' in event.detail) {
          setShowWeight(event.detail.showWeight);
        }
      }
    };

    window.addEventListener('userPreferencesUpdated', handlePreferencesUpdate as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('userPreferencesUpdated', handlePreferencesUpdate as EventListener);
    };
  }, [user]);

  // Update localStorage when sort preferences change
  useEffect(() => {
    setToLocalStorage('assessmentSortKey', sortKey);
  }, [sortKey]);

  useEffect(() => {
    setToLocalStorage('assessmentSortOrder', sortOrder);
  }, [sortOrder]);

  useEffect(() => {
    setToLocalStorage('assessmentFilter', filter);
  }, [filter]);

  // Existing helper functions remain largely unchanged; updating only where necessary
  const formatDateTimeForDisplay = (
    dateStr: string,
    timeStr: string
  ): string => {
    // Convert UTC to local for display
    const { date, time } = utcToLocal(dateStr, timeStr);
    return formatLocalDateTime(date, time);
  };

  const getDaysTillDue = (
    dueDate: string,
    dueTime: string,
    status: string
  ): number | null => {
    const completedStatuses = ["Submitted", "Under Review", "Completed"];
    if (completedStatuses.includes(status)) return null;
    
    // Convert UTC to local for calculation
    const { date, time } = utcToLocal(dueDate, dueTime);
    return getDaysUntil(date, time);
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
        showNotes &&
        event.target instanceof Node &&
        !document
          .getElementById(`notes-modal`)
          ?.contains(event.target) &&
        !document
          .getElementById(`link-modal`)
          ?.contains(event.target)
      ) {
        setShowNotes(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotes]);

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

  const handleStatusChange = async (assessmentId: string, newStatus: string) => {
    if (!user || !assessmentId) return;
    
    try {
      const assessmentRef = doc(db, 'users', user.uid, 'assessments', assessmentId);
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
      const assessmentRef = doc(db, 'users', user.uid, 'semesters', semesterId, 'assessments', assessment.id);
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

  const handleBulkAction = async (action: "complete" | "delete" | "reset") => {
    if (!user || selectedRows.length === 0) return;
    
    if (action === "delete") {
      setShowBulkDeleteModal(true);
      return;
    }

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
        if (action === "complete")
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
      onStatusChange?.(selectedRows[0], "Reset");
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
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
      notes: assessment.notes || '',
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
      onStatusChange?.(assessmentId, editFormData.status);
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

  const handleNotesClick = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setNotesInput(assessment.notes || "");
    setShowNotes(assessment.id || null);
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
                <th className="w-32">Status</th>
                <th
                  onClick={() => handleSort("courseName")}
                  className="cursor-pointer w-48"
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
                  className="cursor-pointer w-56"
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
                  className="cursor-pointer w-48"
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
                {showDaysTillDue && (
                  <th className="w-32">Days Till Due</th>
                )}
                {showWeight && (
                  <th
                    onClick={() => handleSort("weight")}
                    className="cursor-pointer w-24"
                  >
                    <div className="flex items-center space-x-1 group">
                      <span className="group-hover:text-indigo-600">Weight</span>
                      {sortKey === "weight" && (
                        <span className="text-indigo-600">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                )}
                <th className="w-24">Notes</th>
                <th className="w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAssessments.map((assessment, index) => {
                if (!assessment) return null;
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
                        className="input py-1 px-2 text-sm w-full"
                      />
                    </td>
                    <td></td>
                    <td>
                      <div className="flex items-center space-x-2">
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
                    key={assessment?.id || index}
                    className={`transition-all duration-300 ${
                      assessment?.status === "Submitted"
                        ? "bg-emerald-50/40"
                        : assessment?.status === "Missed/Late"
                        ? "bg-red-50/50"
                        : dueDateStatus === "overdue"
                        ? "bg-red-50/40"
                        : dueDateStatus === "urgent"
                        ? "bg-amber-50/40"
                        : ""
                    } ${
                      lastStatusChange === assessment?.id ? "animate-pulse" : ""
                    } hover:bg-gray-50/80`}
                  >
                    <td className="pl-4">
                      {assessment?.id && (
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(assessment.id)}
                          onChange={() => toggleRowSelection(assessment.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      )}
                    </td>
                    <td>
                      <select
                        value={assessment?.status || 'Not started'}
                        onChange={(e) =>
                          assessment?.id && handleStatusChange(assessment.id, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className={`input py-1 px-2 text-sm transition-all duration-300 w-full ${
                          assessment?.status === "Submitted"
                            ? "bg-emerald-100 border-emerald-200 text-emerald-800"
                            : assessment?.status === "In progress"
                            ? "bg-blue-100 border-blue-200 text-blue-800"
                            : assessment?.status === "Draft"
                            ? "bg-purple-100 border-purple-200 text-purple-800"
                            : assessment?.status === "Pending Submission"
                            ? "bg-orange-100 border-orange-200 text-orange-800"
                            : assessment?.status === "Under Review"
                            ? "bg-indigo-100 border-indigo-200 text-indigo-800"
                            : assessment?.status === "Needs Revision"
                            ? "bg-amber-100 border-amber-200 text-amber-800"
                            : assessment?.status === "Missed/Late"
                            ? "bg-red-100 border-red-200 text-red-800"
                            : assessment?.status === "On Hold"
                            ? "bg-yellow-100 border-yellow-200 text-yellow-800"
                            : "bg-gray-100 border-gray-200 text-gray-800"
                        }`}
                      >
                        <optgroup label="Planning">
                          <option value="Not started">Not started</option>
                          <option value="Draft">Draft</option>
                        </optgroup>
                        <optgroup label="In Progress">
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
                    <td className="font-medium whitespace-nowrap">{assessment?.courseName}</td>
                    <td>
                      <div className="flex items-center">
                        <span
                          className="truncate max-w-[240px]"
                          title={assessment?.assignmentName}
                        >
                          {assessment?.assignmentName}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      <span className={`${
                        assessment?.status === "Submitted"
                          ? "text-emerald-600 font-medium"
                          : assessment?.status === "Under Review"
                          ? "text-indigo-600 font-medium"
                          : assessment?.status === "In progress"
                          ? "text-blue-600 font-medium"
                          : assessment?.status === "Draft"
                          ? "text-purple-600 font-medium"
                          : assessment?.status === "Pending Submission"
                          ? "text-orange-600 font-medium"
                          : assessment?.status === "Needs Revision"
                          ? "text-amber-600 font-medium"
                          : assessment?.status === "Missed/Late"
                          ? "text-red-600 font-medium"
                          : assessment?.status === "On Hold"
                          ? "text-yellow-600 font-medium"
                          : dueDateStatus === "overdue"
                          ? "text-red-600 font-medium"
                          : dueDateStatus === "urgent"
                          ? "text-amber-600 font-medium"
                          : ""
                      }`}>
                        {assessment?.dueDate && assessment?.dueTime && 
                          formatDateTimeForDisplay(assessment.dueDate, assessment.dueTime)}
                      </span>
                    </td>
                    {showDaysTillDue && (
                      <td className="whitespace-nowrap">{formatDaysTillDue(daysTillDue)}</td>
                    )}
                    {showWeight && (
                      <td className="whitespace-nowrap">
                        {assessment?.weight ? (
                          <span className="font-medium">
                            {assessment.weight}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    )}
                    <td>
                      <button
                        onClick={() => handleNotesClick(assessment)}
                        className={`p-1.5 rounded ${
                          assessment?.notes
                            ? "text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                            : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                        }`}
                        title={assessment?.notes ? "Edit Notes" : "Add Notes"}
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
                    </td>
                    <td
                      onClick={(e) => e.stopPropagation()}
                    >
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
                        {dropdownOpenId === assessment?.id && (
                          <div className="absolute right-0 z-10 mt-2 w-36 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  handleDropdownToggle(null);
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
                                  handleDropdownToggle(null);
                                  handleDeleteClick(assessment);
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
      {showNotes && selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            id="notes-modal"
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl h-[90vh] flex flex-col animate-scale"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-medium text-gray-900">
                  Notes for {selectedAssessment.assignmentName}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedAssessment.courseName}
                </p>
                <div className="mt-2 flex items-center space-x-4 text-sm">
                  <span className="text-gray-600">
                    Due: {formatDateTimeForDisplay(selectedAssessment.dueDate, selectedAssessment.dueTime)}
                  </span>
                  <span className="text-gray-600">
                    Weight: {selectedAssessment.weight}%
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedAssessment.status === "Submitted" ? "bg-emerald-100 text-emerald-800" :
                    selectedAssessment.status === "In progress" ? "bg-blue-100 text-blue-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {selectedAssessment.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const text = `Assignment: ${selectedAssessment.assignmentName}\nCourse: ${selectedAssessment.courseName}\nDue: ${formatDateTimeForDisplay(selectedAssessment.dueDate, selectedAssessment.dueTime)}\nWeight: ${selectedAssessment.weight}%\nStatus: ${selectedAssessment.status}\n\nNotes:\n${notesInput}`;
                    navigator.clipboard.writeText(text);
                  }}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  title="Copy Notes"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copy
                </button>
                <button
                  onClick={() => {
                    setShowNotes(null);
                    setSelectedAssessment(null);
                  }}
                  className="inline-flex items-center p-1.5 border border-transparent rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 mb-4 border rounded-lg overflow-hidden">
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
                  setShowNotes(null);
                  setSelectedAssessment(null);
                }}
                className="btn-outline py-1.5 px-4"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSaveNotes();
                  setShowNotes(null);
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
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setAssessmentToDelete(null);
        }}
        onConfirm={() => assessmentToDelete && handleDeleteAssessment(assessmentToDelete)}
        assessmentName={assessmentToDelete?.assignmentName || ''}
      />

      {/* Bulk Delete Confirmation Modal */}
      <BulkDeleteConfirmationModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleConfirmBulkDelete}
        count={selectedRows.length}
      />
    </div>
  );
};

export default AssessmentsTable;
