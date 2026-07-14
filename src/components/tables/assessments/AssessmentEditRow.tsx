import { Assessment, AssessmentStatus } from "../../../types/assessment";
import StatusSelect from "../../ui/StatusSelect";
import { CheckSolidIcon, CloseSolidIcon } from "../../ui/icons";

interface AssessmentEditRowProps {
  isSelected: boolean;
  onToggleSelect: () => void;
  editFormData: Assessment;
  onFieldChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  onStatusChange: (value: AssessmentStatus) => void;
  onSave: () => void;
  onCancel: () => void;
  showWeight: boolean;
}

/** Inline edit form for a single assessment (mobile card + desktop grid variants). */
const AssessmentEditRow = ({
  isSelected,
  onToggleSelect,
  editFormData,
  onFieldChange,
  onStatusChange,
  onSave,
  onCancel,
  showWeight,
}: AssessmentEditRowProps) => (
  <div className="bg-gray-50/50 dark:bg-dark-bg-tertiary/30 rounded-lg transition-all duration-300 p-4 animate-fade-in">
    {/* Mobile Edit Form */}
    <div className="lg:hidden space-y-4">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="h-5 w-5 rounded border-gray-300 dark:border-dark-border-primary text-light-button-primary dark:text-dark-button-primary focus:ring-light-focus-ring dark:focus:ring-dark-focus-ring"
        />
        <div className="flex-1">
          <StatusSelect
            value={editFormData.status}
            onChange={onStatusChange}
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
            onChange={onFieldChange}
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
            onChange={onFieldChange}
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
              onChange={onFieldChange}
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
              onChange={onFieldChange}
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
              onChange={onFieldChange}
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
          onClick={onCancel}
          className="btn-outline py-2.5 px-4 text-sm min-h-[44px] min-w-[80px]"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
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
          checked={isSelected}
          onChange={onToggleSelect}
          className="h-4 w-4 rounded border-gray-300 dark:border-dark-border-primary text-light-button-primary dark:text-dark-button-primary focus:ring-light-focus-ring dark:focus:ring-dark-focus-ring"
        />
        <StatusSelect
          value={editFormData.status}
          onChange={onStatusChange}
          size="sm"
          className="flex-1"
        />
      </div>
      <div className="col-span-2">
        <input
          type="text"
          name="courseName"
          value={editFormData.courseName}
          onChange={onFieldChange}
          placeholder="Course Name"
          className="input py-1 px-2 text-md w-full dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border-primary rounded-md"
        />
      </div>
      <div className="col-span-4">
        <input
          type="text"
          name="assignmentName"
          value={editFormData.assignmentName}
          onChange={onFieldChange}
          placeholder="Assignment Name"
          className="input py-1 px-2 text-md w-full dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border-primary rounded-md"
        />
      </div>
      <div className="col-span-4 flex items-center space-x-2">
        <input
          type="date"
          name="dueDate"
          value={editFormData.dueDate}
          onChange={onFieldChange}
          className="input py-1 px-2 text-md flex-1 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border-primary rounded-md"
        />
        <input
          type="time"
          name="dueTime"
          value={editFormData.dueTime}
          onChange={onFieldChange}
          className="input py-1 px-2 text-md w-24 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border-primary rounded-md"
        />
        {showWeight && (
          <input
            type="number"
            name="weight"
            value={editFormData.weight}
            onChange={onFieldChange}
            min="0"
            max="100"
            step="0.1"
            placeholder="Weight"
            className="input py-1 px-2 text-md w-20 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border-primary rounded-md"
          />
        )}
        <div className="flex items-center space-x-1">
          <button
            onClick={onSave}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-md transition-colors"
          >
            <CheckSolidIcon className="h-4 w-4" />
          </button>
          <button
            onClick={onCancel}
            className="text-gray-600 dark:text-dark-text-tertiary hover:text-gray-800 dark:hover:text-dark-text-secondary p-1.5 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary rounded-md transition-colors"
          >
            <CloseSolidIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default AssessmentEditRow;
