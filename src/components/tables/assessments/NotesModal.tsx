import { useState } from "react";
import { Copy, X } from "lucide-react";
import { Assessment } from "../../../types/assessment";
import { cn } from "@/lib/utils";
import { Button } from "../../ui/button";
import RichTextEditor from "../../editor/RichTextEditor";
import { statusTintClasses } from "./StatusSelect";
import { formatLocalDateTime } from "../../../utils/dateUtils";

interface NotesModalProps {
  assessment: Assessment;
  onClose: () => void;
  onSave: (notes: string) => void;
}

/** Large overlay with the rich-text notes editor for one assessment. */
const NotesModal = ({ assessment, onClose, onSave }: NotesModalProps) => {
  const [draft, setDraft] = useState(assessment.notes ?? "");

  const handleCopy = () => {
    const text = `Assignment: ${assessment.assignmentName}\nCourse: ${
      assessment.courseName
    }\nDue: ${formatLocalDateTime(assessment.dueDate, assessment.dueTime)}\nWeight: ${
      assessment.weight
    }%\nStatus: ${assessment.status}\n\nNotes:\n${draft}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div
      className="fixed inset-0 z-150 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-card shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-label={`Notes for ${assessment.assignmentName}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-foreground">
              Notes for {assessment.assignmentName}
            </h3>
            <p className="text-sm text-muted-foreground">{assessment.courseName}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Due {formatLocalDateTime(assessment.dueDate, assessment.dueTime)}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Weight {assessment.weight}%
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium",
                  statusTintClasses[assessment.status],
                )}
              >
                {assessment.status}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button type="button" variant="secondary" size="sm" onClick={handleCopy}>
              <Copy aria-hidden />
              Copy
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              onClick={onClose}
              aria-label="Close"
            >
              <X aria-hidden />
            </Button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5">
          {/* Writing canvas, not a form field: tonal fill only, no focus ring (founder call 2026-07-16) */}
          <div className="overflow-hidden rounded-xl bg-input">
            <RichTextEditor
              content={draft}
              onChange={setDraft}
              placeholder="Add your notes here..."
            />
          </div>
        </div>
        <div className="flex flex-none justify-end gap-2 px-5 py-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={() => onSave(draft)}>
            Save notes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotesModal;
