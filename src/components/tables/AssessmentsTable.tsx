import React from "react";
import { useState, useEffect } from "react";
import { updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { Check, ChevronsUpDown, FileText, ListFilter } from "lucide-react";
import { getAssessmentDocRef } from "../../lib/firebaseUtils";
import { useAuth } from "../../contexts/AuthContext";
import { useDisplayPreferences } from "../../hooks/useDisplayPreferences";
import { getDaysUntil } from "../../utils/dateUtils";
import { Assessment, AssessmentStatus, AssessmentsTableProps } from "../../types/assessment";
import { isCompletedStatus } from "../../constants/assessment";
import { cn } from "@/lib/utils";
import ConfirmationModal from "../common/ConfirmationModal";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useTableSettings } from "./assessments/useTableSettings";
import BulkActionsBar from "./assessments/BulkActionsBar";
import TableHeader from "./assessments/TableHeader";
import AssessmentRow from "./assessments/AssessmentRow";
import AssessmentEditRow from "./assessments/AssessmentEditRow";
import NotesModal from "./assessments/NotesModal";

const filterOptions = [
  { value: "all", label: "All tasks" },
  { value: "not_submitted", label: "Not submitted" },
  { value: "submitted", label: "Submitted" },
];

const AssessmentsTable: React.FC<AssessmentsTableProps> = ({
  assessments,
  semesterId,
  onStatusChange,
}) => {
  const { user } = useAuth();
  const [localAssessments, setLocalAssessments] = useState<Assessment[]>(assessments);

  // Update local assessments when props change
  useEffect(() => {
    setLocalAssessments(assessments);
  }, [assessments]);
  const { sortKey, sortOrder, filter, setFilter } = useTableSettings();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { showDaysTillDue, showWeight, showNotes } = useDisplayPreferences(user);
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
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [notesInput, setNotesInput] = useState<string>("");
  const [showNotesModal, setShowNotesModal] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<Assessment | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showBulkStatusUpdate, setShowBulkStatusUpdate] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const getDaysTillDue = (dueDate: string, dueTime: string, status: string): number | null => {
    // Includes legacy status values that may still exist on old Firestore documents
    const completedStatuses = ["Submitted", "Under Review", "Completed", "Missed"];
    if (completedStatuses.includes(status)) return null;

    return getDaysUntil(dueDate, dueTime);
  };

  const filteredAssessments = localAssessments.filter((assessment) => {
    if (filter === "all") return true;
    if (filter === "not_submitted") return !isCompletedStatus(assessment.status);
    if (filter === "submitted") return isCompletedStatus(assessment.status);
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

  const handleStatusChange = async (assessmentId: string, newStatus: AssessmentStatus) => {
    if (!user || !assessmentId) return;

    // Optimistic update: Update UI immediately
    setLocalAssessments((prev) =>
      prev.map((assessment) =>
        assessment.id === assessmentId ? { ...assessment, status: newStatus } : assessment,
      ),
    );

    try {
      const assessmentRef = getAssessmentDocRef(user.uid, semesterId, assessmentId);
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
      const assessmentRef = getAssessmentDocRef(user.uid, semesterId, assessment.id);
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
      setLocalAssessments((prev) => prev.filter((a) => !selectedRows.includes(a.id || "")));
      setSelectedRows([]);
      setShowBulkDeleteModal(false);
    } catch (error) {
      console.error("Error performing bulk delete:", error);
    }
  };

  const toggleSelectAll = () => {
    setSelectedRows(
      selectedRows.length === sortedAssessments.length && sortedAssessments.length > 0
        ? []
        : sortedAssessments.map((a) => a.id || "").filter(Boolean),
    );
  };

  const toggleRowSelection = (id: string) => {
    setSelectedRows(
      selectedRows.includes(id)
        ? selectedRows.filter((rowId) => rowId !== id)
        : [...selectedRows, id],
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
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
      const assessmentRef = getAssessmentDocRef(user.uid, semesterId, assessmentId);
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
      const assessmentRef = getAssessmentDocRef(user.uid, semesterId, selectedAssessment.id);

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

  const handleBulkStatusUpdate = async (newStatus: AssessmentStatus) => {
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
            : assessment,
        ),
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Assessments</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              className="w-full justify-between sm:w-auto sm:min-w-44"
              aria-label="Filter assessments"
            >
              <span className="flex min-w-0 items-center gap-2">
                <ListFilter className="text-muted-foreground" aria-hidden />
                <span className="truncate">
                  {filterOptions.find((option) => option.value === filter)?.label ?? "All tasks"}
                </span>
              </span>
              <ChevronsUpDown className="text-muted-foreground" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            {filterOptions.map((option) => (
              <DropdownMenuItem key={option.value} onSelect={() => setFilter(option.value)}>
                <Check
                  className={cn(filter === option.value ? "opacity-100" : "opacity-0")}
                  aria-hidden
                />
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedRows.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedRows.length}
          showBulkStatusUpdate={showBulkStatusUpdate}
          selectedStatus={selectedStatus}
          onStatusSelect={handleStatusSelect}
          onConfirmStatusUpdate={() => handleBulkStatusUpdate(selectedStatus as AssessmentStatus)}
          onCancelStatusUpdate={handleCancelStatusUpdate}
          onDeleteSelected={() => setShowBulkDeleteModal(true)}
          onClearSelection={() => setSelectedRows([])}
        />
      )}

      {sortedAssessments.length === 0 ? (
        <div className="py-10 text-center">
          <FileText className="mx-auto mb-4 size-12 text-muted-foreground/50" aria-hidden />
          <p className="mb-2 text-base font-semibold text-foreground">No assessments found</p>
          <p className="text-sm text-muted-foreground">
            Upload a course outline or add assessments manually to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <TableHeader
            allSelected={
              selectedRows.length === sortedAssessments.length && sortedAssessments.length > 0
            }
            onToggleSelectAll={toggleSelectAll}
            totalCount={sortedAssessments.length}
            selectedCount={selectedRows.length}
            showWeight={showWeight}
          />

          {/* Assessment Cards */}
          <div className="space-y-2">
            {sortedAssessments.map((assessment) => {
              if (!assessment) return null;
              const daysTillDue = getDaysTillDue(
                assessment.dueDate,
                assessment.dueTime,
                assessment.status,
              );
              return editingId === assessment.id ? (
                <AssessmentEditRow
                  key={`editing-${assessment.id}`}
                  isSelected={selectedRows.includes(assessment.id || "")}
                  onToggleSelect={() => toggleRowSelection(assessment.id || "")}
                  editFormData={editFormData}
                  onFieldChange={handleEditFormChange}
                  onStatusChange={(value) =>
                    setEditFormData((prev) => ({ ...prev, status: value }))
                  }
                  onSave={() => assessment.id && handleSaveEdit(assessment.id)}
                  onCancel={handleCancelEdit}
                  showWeight={showWeight}
                />
              ) : (
                <AssessmentRow
                  key={assessment.id}
                  assessment={assessment}
                  daysTillDue={daysTillDue}
                  isSelected={selectedRows.includes(assessment.id || "")}
                  onToggleSelect={() => toggleRowSelection(assessment.id || "")}
                  showWeight={showWeight}
                  showDaysTillDue={showDaysTillDue}
                  showNotes={showNotes}
                  onStatusChange={(value) =>
                    assessment.id && handleStatusChange(assessment.id, value)
                  }
                  onNotesClick={() => handleNotesClick(assessment)}
                  onEditClick={() => handleEditClick(assessment)}
                  onDeleteClick={() => handleDeleteClick(assessment)}
                />
              );
            })}
          </div>
        </div>
      )}
      {/* Notes Modal */}
      {showNotesModal && selectedAssessment && (
        <NotesModal
          assessment={selectedAssessment}
          notesInput={notesInput}
          onNotesChange={setNotesInput}
          onAddLink={handleAddLink}
          onClose={() => {
            setShowNotesModal(null);
            setSelectedAssessment(null);
          }}
          onSave={() => {
            handleSaveNotes();
            setShowNotesModal(null);
          }}
        />
      )}
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setAssessmentToDelete(null);
        }}
        onConfirm={() => assessmentToDelete && handleDeleteAssessment(assessmentToDelete)}
        title="Delete assessment"
        message={`Are you sure you want to delete "${assessmentToDelete?.assignmentName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
      {/* Bulk Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleConfirmBulkDelete}
        title="Delete assessments"
        message={`Are you sure you want to delete ${selectedRows.length} selected assessment${
          selectedRows.length === 1 ? "" : "s"
        }? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default AssessmentsTable;
