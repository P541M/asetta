import { Assessment } from "../../../types/assessment";
import RichTextEditor from "../../editor/RichTextEditor";
import { getStatusBadgeClasses } from "../../../utils/statusUtils";
import { formatLocalDateTime } from "../../../utils/dateUtils";

interface NotesModalProps {
  assessment: Assessment;
  notesInput: string;
  onNotesChange: (value: string) => void;
  onAddLink: (callback: (url: string, text: string) => void) => void;
  onClose: () => void;
  onSave: () => void;
}

/** Full-screen modal with the rich-text notes editor for one assessment. */
const NotesModal = ({
  assessment,
  notesInput,
  onNotesChange,
  onAddLink,
  onClose,
  onSave,
}: NotesModalProps) => (
  <div className="modal-backdrop">
    <div id="notes-modal" className="modal-container w-full max-w-4xl max-h-[90vh] flex flex-col">
      <div className="modal-header">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-medium text-light-text-primary dark:text-dark-text-primary">
              Notes for {assessment.assignmentName}
            </h3>
            <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary font-medium">
              {assessment.courseName}
            </p>
            <div className="mt-2 flex items-center space-x-4 text-sm">
              <span className="text-light-text-secondary dark:text-dark-text-secondary">
                Due: {formatLocalDateTime(assessment.dueDate, assessment.dueTime)}
              </span>
              <span className="text-light-text-secondary dark:text-dark-text-secondary">
                Weight: {assessment.weight}%
              </span>
              <span className={getStatusBadgeClasses(assessment.status)}>{assessment.status}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const text = `Assignment: ${assessment.assignmentName}\nCourse: ${
                  assessment.courseName
                }\nDue: ${formatLocalDateTime(
                  assessment.dueDate,
                  assessment.dueTime,
                )}\nWeight: ${assessment.weight}%\nStatus: ${
                  assessment.status
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
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy
            </button>
            <button
              onClick={onClose}
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
            onChange={onNotesChange}
            onAddLink={onAddLink}
            placeholder={`Add your notes here...`}
          />
        </div>
      </div>
      <div className="modal-footer flex-none">
        <button onClick={onClose} className="btn-outline py-1.5 px-4">
          Cancel
        </button>
        <button onClick={onSave} className="btn-primary py-1.5 px-4">
          Save Notes
        </button>
      </div>
    </div>
  </div>
);

export default NotesModal;
