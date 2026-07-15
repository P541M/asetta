import { Assessment, AssessmentStatus } from "@/types/assessment";
import { cn } from "@/lib/utils";
import { formatLocalDateTime } from "../../../utils/dateUtils";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { NotesIcon, EditIcon, TrashIcon } from "../../ui/icons";
import StatusSelect from "./StatusSelect";

interface AssessmentRowProps {
  assessment: Assessment;
  daysTillDue: number | null;
  isSelected: boolean;
  onToggleSelect: () => void;
  showWeight: boolean;
  showDaysTillDue: boolean;
  showNotes: boolean;
  onStatusChange: (value: AssessmentStatus) => void;
  onNotesClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

const daysTillDueLabel = (daysTillDue: number) =>
  daysTillDue < 0
    ? "Overdue"
    : daysTillDue === 0
      ? "Due today"
      : daysTillDue === 1
        ? "Due tomorrow"
        : `${daysTillDue} days left`;

const urgencyTextClass = (daysTillDue: number) =>
  daysTillDue <= 3
    ? "text-destructive"
    : daysTillDue <= 7
      ? "text-primary"
      : "text-muted-foreground";

const urgencyChipClass = (daysTillDue: number) =>
  daysTillDue <= 3
    ? "bg-destructive/10 text-destructive"
    : daysTillDue <= 7
      ? "bg-primary/10 text-primary"
      : "bg-foreground/5 text-muted-foreground";

/** Read-only assessment row (mobile card + desktop grid variants). */
const AssessmentRow = ({
  assessment,
  daysTillDue,
  isSelected,
  onToggleSelect,
  showWeight,
  showDaysTillDue,
  showNotes,
  onStatusChange,
  onNotesClick,
  onEditClick,
  onDeleteClick,
}: AssessmentRowProps) => (
  <div className="rounded-xl bg-secondary/50 p-4">
    {/* Mobile Card Layout */}
    <div className="lg:hidden space-y-4">
      {/* Header with checkbox and status */}
      <div className="flex items-center gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
          aria-label={`Select ${assessment.assignmentName}`}
        />
        <div className="flex-1">
          <StatusSelect value={assessment.status} onChange={onStatusChange} size="md" />
        </div>
      </div>

      {/* Course and Assignment Info — the assignment is the card title, the course its label */}
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-medium text-muted-foreground">
            {assessment.courseName}
          </p>
          {showWeight && assessment.weight > 0 && (
            <span className="text-sm font-medium text-muted-foreground">{assessment.weight}%</span>
          )}
        </div>
        <h3 className="text-base font-semibold text-foreground">{assessment.assignmentName}</h3>
      </div>

      {/* Due Date Info */}
      <div className="space-y-1.5">
        <p className="text-sm text-muted-foreground">
          Due {formatLocalDateTime(assessment.dueDate, assessment.dueTime)}
        </p>
        {showDaysTillDue && daysTillDue !== null && (
          <span
            className={cn(
              "inline-block rounded-full px-2 py-1 text-xs font-medium",
              urgencyChipClass(daysTillDue),
            )}
          >
            {daysTillDueLabel(daysTillDue)}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-1">
        {showNotes && (
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={onNotesClick}
            title={assessment.notes ? "View or edit notes" : "Add notes"}
            aria-label={assessment.notes ? "View or edit notes" : "Add notes"}
          >
            <NotesIcon
              className={cn("h-5 w-5", assessment.notes ? "text-primary" : "text-muted-foreground")}
            />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={onEditClick}
          title="Edit assessment"
          aria-label="Edit assessment"
        >
          <EditIcon className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={onDeleteClick}
          title="Delete assessment"
          aria-label="Delete assessment"
        >
          <TrashIcon className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
    </div>

    {/* Desktop Table Layout */}
    <div className="hidden lg:grid grid-cols-12 gap-2 items-center">
      <div className="col-span-2 flex items-center gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
          aria-label={`Select ${assessment.assignmentName}`}
        />
        <StatusSelect
          value={assessment.status}
          onChange={onStatusChange}
          size="sm"
          className="min-w-0 flex-1"
        />
      </div>
      <div className="col-span-2">
        <p className="truncate text-sm text-foreground">{assessment.courseName}</p>
      </div>
      <div className="col-span-4">
        <p className="text-sm font-medium text-foreground">{assessment.assignmentName}</p>
      </div>
      <div className="col-span-4 flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-foreground">
            {formatLocalDateTime(assessment.dueDate, assessment.dueTime)}
          </span>
          {showDaysTillDue && daysTillDue !== null && (
            <span className={cn("text-xs font-medium", urgencyTextClass(daysTillDue))}>
              {daysTillDueLabel(daysTillDue)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {showWeight && assessment.weight > 0 && (
            <span className="text-sm font-medium text-muted-foreground">{assessment.weight}%</span>
          )}
          <div className="flex items-center gap-0.5">
            {showNotes && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onNotesClick}
                title={assessment.notes ? "View or edit notes" : "Add notes"}
                aria-label={assessment.notes ? "View or edit notes" : "Add notes"}
              >
                <NotesIcon
                  className={cn(
                    "h-4 w-4",
                    assessment.notes ? "text-primary" : "text-muted-foreground",
                  )}
                />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onEditClick}
              title="Edit assessment"
              aria-label="Edit assessment"
            >
              <EditIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onDeleteClick}
              title="Delete assessment"
              aria-label="Delete assessment"
            >
              <TrashIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AssessmentRow;
