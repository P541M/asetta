import StatusSelect from "../../ui/StatusSelect";

interface BulkActionsBarProps {
  selectedCount: number;
  showBulkStatusUpdate: boolean;
  selectedStatus: string;
  onStatusSelect: (status: string) => void;
  onConfirmStatusUpdate: () => void;
  onCancelStatusUpdate: () => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
}

/** Toolbar shown above the table while one or more rows are selected. */
const BulkActionsBar = ({
  selectedCount,
  showBulkStatusUpdate,
  selectedStatus,
  onStatusSelect,
  onConfirmStatusUpdate,
  onCancelStatusUpdate,
  onDeleteSelected,
  onClearSelection,
}: BulkActionsBarProps) => (
  <div className="mb-4 p-4 bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm border border-gray-100 dark:border-dark-border-primary animate-fade-in">
    {/* Mobile Layout */}
    <div className="lg:hidden space-y-4">
      <div className="text-center">
        <span className="text-base font-medium text-gray-700 dark:text-dark-text-primary">
          {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
        </span>
      </div>

      <div className="space-y-3">
        {!showBulkStatusUpdate ? (
          <div className="w-full">
            <StatusSelect
              value={null}
              onChange={(value) => onStatusSelect(value)}
              size="md"
              placeholder="Update Status"
              className="w-full"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-center">
              <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Update to: <span className="font-medium">{selectedStatus}</span>
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onConfirmStatusUpdate}
                className="btn-primary flex-1 py-2.5 px-4 text-sm min-h-[44px]"
              >
                Confirm
              </button>
              <button
                onClick={onCancelStatusUpdate}
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
          onClick={onDeleteSelected}
          className="btn-danger py-2.5 px-4 text-sm w-full min-h-[44px]"
        >
          Delete Selected
        </button>
        <button
          onClick={onClearSelection}
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
          {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
        </span>
        <div className="flex items-center space-x-2">
          {!showBulkStatusUpdate ? (
            <div className="min-w-[140px]">
              <StatusSelect
                value={null}
                onChange={(value) => onStatusSelect(value)}
                size="sm"
                placeholder="Update Status"
                className="text-sm"
              />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Update to: <span className="font-medium">{selectedStatus}</span>
              </span>
              <button onClick={onConfirmStatusUpdate} className="btn-primary py-1.5 px-3 text-sm">
                Confirm
              </button>
              <button onClick={onCancelStatusUpdate} className="btn-outline py-1.5 px-3 text-sm">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button onClick={onDeleteSelected} className="btn-danger py-1.5 px-3 text-sm">
          Delete Selected
        </button>
        <button
          onClick={onClearSelection}
          className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-secondary dark:hover:text-dark-text-secondary"
        >
          Clear Selection
        </button>
      </div>
    </div>
  </div>
);

export default BulkActionsBar;
