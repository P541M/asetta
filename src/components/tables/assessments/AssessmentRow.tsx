import { Assessment, AssessmentStatus } from "../../../types/assessment";
import StatusSelect from "../../ui/StatusSelect";
import { getStatusTextClasses } from "../../../utils/statusUtils";
import { formatLocalDateTime } from "../../../utils/dateUtils";
import { NotesIcon, EditIcon, TrashIcon } from "../../ui/icons";

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
  daysTillDue === 0 ? "Due today" : daysTillDue === 1 ? "Due tomorrow" : `${daysTillDue} days left`;

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
  <div className="bg-gray-50/50 dark:bg-dark-bg-tertiary/30 rounded-lg transition-all duration-300 p-4">
    {/* Mobile Card Layout */}
    <div className="lg:hidden space-y-4">
      {/* Header with checkbox and status */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="h-5 w-5 rounded-sm border-gray-300 dark:border-dark-border-primary text-light-button-primary dark:text-dark-button-primary focus:ring-light-focus-ring dark:focus:ring-dark-focus-ring"
        />
        <div className="flex-1">
          <StatusSelect
            value={assessment.status}
            onChange={onStatusChange}
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
        <span className={`text-sm font-medium ${getStatusTextClasses(assessment.status)}`}>
          Due: {formatLocalDateTime(assessment.dueDate, assessment.dueTime)}
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
            {daysTillDueLabel(daysTillDue)}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-200 dark:border-dark-border-primary">
        {showNotes && (
          <button
            onClick={onNotesClick}
            className={`${
              assessment.notes
                ? "text-light-button-primary dark:text-dark-button-primary bg-blue-50 dark:bg-blue-900/30"
                : "text-gray-500 dark:text-dark-text-tertiary"
            } hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary p-3 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center`}
            title={assessment.notes ? "View/Edit Notes" : "Add Notes"}
          >
            <NotesIcon className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={onEditClick}
          className="text-gray-500 dark:text-dark-text-tertiary hover:text-gray-700 dark:hover:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary p-3 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Edit Assessment"
        >
          <EditIcon className="h-5 w-5" />
        </button>
        <button
          onClick={onDeleteClick}
          className="text-gray-500 dark:text-dark-text-tertiary hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 p-3 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Delete Assessment"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>

    {/* Desktop Table Layout */}
    <div className="hidden lg:grid grid-cols-12 gap-2 items-center">
      <div className="col-span-2 flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="h-4 w-4 rounded-sm border-gray-300 dark:border-dark-border-primary text-light-button-primary dark:text-dark-button-primary focus:ring-light-focus-ring dark:focus:ring-dark-focus-ring"
        />
        <StatusSelect
          value={assessment.status}
          onChange={onStatusChange}
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
          <span className={`text-md ${getStatusTextClasses(assessment.status)}`}>
            {formatLocalDateTime(assessment.dueDate, assessment.dueTime)}
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
              {daysTillDueLabel(daysTillDue)}
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
                onClick={onNotesClick}
                className={`${
                  assessment.notes
                    ? "text-light-button-primary dark:text-dark-button-primary"
                    : "text-gray-500 dark:text-dark-text-tertiary"
                } hover:text-gray-700 dark:hover:text-dark-text-secondary p-1 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-md transition-colors`}
                title={assessment.notes ? "View/Edit Notes" : "Add Notes"}
              >
                <NotesIcon className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onEditClick}
              className="text-gray-500 dark:text-dark-text-tertiary hover:text-gray-700 dark:hover:text-dark-text-secondary p-1 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-md transition-colors"
            >
              <EditIcon className="h-4 w-4" />
            </button>
            <button
              onClick={onDeleteClick}
              className="text-gray-500 dark:text-dark-text-tertiary hover:text-red-600 dark:hover:text-red-400 p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AssessmentRow;
