import React, { useState, useEffect, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Semester } from "@/types/semester";
import { CheckSolidIcon, CloseSolidIcon, EditIcon, TrashIcon } from "../../ui/icons";

const DragHandle = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 text-light-text-tertiary dark:text-dark-text-tertiary cursor-move"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9h8M8 15h8" />
  </svg>
);

interface SortableSemesterProps {
  semester: Semester;
  isSelected: boolean;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

/** Draggable row in the Manage Semesters modal with inline rename. */
function SortableSemester({ semester, isSelected, onEdit, onDelete }: SortableSemesterProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: semester.id,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(semester.name);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleEditStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(semester.name);
  };

  const handleEditSave = async () => {
    if (editValue.trim() !== "") {
      await onEdit(semester.id, editValue.trim());
      setIsEditing(false);
    }
  };

  const handleEditSaveWithEvent = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    handleEditSave();
  };

  const handleEditCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditValue(semester.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      handleEditSave();
    } else if (e.key === "Escape") {
      handleEditCancel(e as unknown as React.MouseEvent);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`py-2 px-4 hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary flex items-center justify-between ${
        isDragging ? "bg-light-hover-primary dark:bg-dark-hover-primary shadow-lg rounded-lg" : ""
      }`}
    >
      <div className="flex items-center space-x-3 flex-grow">
        <div {...attributes} {...listeners}>
          <DragHandle />
        </div>
        {isEditing ? (
          <div className="flex items-center flex-grow">
            <input
              ref={editInputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input text-sm py-1 px-2 flex-grow min-w-0"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex items-center px-1">
              <button
                onClick={handleEditSaveWithEvent}
                className="p-1.5 text-light-button-primary dark:text-dark-button-primary hover:text-light-button-primary-hover dark:hover:text-dark-button-primary-hover hover:bg-light-button-primary/10 dark:hover:bg-dark-button-primary/10 rounded-md transition-colors"
                title="Save"
              >
                <CheckSolidIcon className="h-4 w-4" />
              </button>
              <button
                onClick={handleEditCancel}
                className="p-1.5 text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-secondary dark:hover:text-dark-text-secondary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary rounded-md transition-colors ml-1"
                title="Cancel"
              >
                <CloseSolidIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <span
              className={`font-medium ${
                isSelected
                  ? "text-light-button-primary dark:text-dark-button-primary"
                  : "dark:text-dark-text-primary"
              }`}
            >
              {semester.name}
            </span>
            {isSelected && <span className="badge-primary">Current</span>}
          </>
        )}
      </div>
      {!isEditing && (
        <div className="flex items-center space-x-2">
          <button
            onClick={handleEditStart}
            className="text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-button-primary dark:hover:text-dark-button-primary p-1.5 rounded-md hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary transition-colors"
            title="Edit"
          >
            <EditIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(semester.id)}
            className="text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-error-text dark:hover:text-dark-error-text p-1.5 rounded-md hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary transition-colors"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default SortableSemester;
