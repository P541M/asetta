import React, { useState, useEffect, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, GripVertical, Pencil, Trash2, X } from "lucide-react";
import { Semester } from "@/types/semester";
import { cn } from "@/lib/utils";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";

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

  const handleEditSave = async () => {
    if (editValue.trim() !== "") {
      await onEdit(semester.id, editValue.trim());
      setIsEditing(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditValue(semester.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      handleEditSave();
    } else if (e.key === "Escape") {
      handleEditCancel();
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
      className={cn(
        "flex items-center justify-between gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-accent",
        isDragging && "bg-accent shadow-lg",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          className="cursor-move rounded-sm text-muted-foreground outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Reorder ${semester.name}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" aria-hidden />
        </button>
        {isEditing ? (
          <div className="flex min-w-0 flex-1 items-center gap-1">
            <Input
              ref={editInputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="h-8 min-w-0 flex-1 bg-card px-2 text-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-primary"
              onClick={handleEditSave}
              aria-label="Save name"
            >
              <Check aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              onClick={handleEditCancel}
              aria-label="Cancel rename"
            >
              <X aria-hidden />
            </Button>
          </div>
        ) : (
          <>
            <span className="truncate text-sm font-medium text-foreground">{semester.name}</span>
            {isSelected && (
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Current
              </span>
            )}
          </>
        )}
      </div>
      {!isEditing && (
        <div className="flex shrink-0 items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              setIsEditing(true);
              setEditValue(semester.name);
            }}
            aria-label={`Rename ${semester.name}`}
          >
            <Pencil aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(semester.id)}
            aria-label={`Delete ${semester.name}`}
          >
            <Trash2 aria-hidden />
          </Button>
        </div>
      )}
    </div>
  );
}

export default SortableSemester;
