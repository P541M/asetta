interface TableHeaderProps {
  allSelected: boolean;
  onToggleSelectAll: () => void;
  totalCount: number;
  selectedCount: number;
  showWeight: boolean;
}

/** Desktop column headers plus the mobile select-all bar. */
const TableHeader = ({
  allSelected,
  onToggleSelectAll,
  totalCount,
  selectedCount,
  showWeight,
}: TableHeaderProps) => (
  <>
    {/* Headers - Hidden on mobile, visible on desktop */}
    <div className="hidden lg:grid grid-cols-12 gap-2 px-4 py-3 bg-gray-100/50 dark:bg-dark-bg-tertiary/50 rounded-lg">
      <div className="col-span-2 flex items-center space-x-3">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={onToggleSelectAll}
          className="h-4 w-4 rounded-sm border-gray-300 dark:border-dark-border-primary text-light-button-primary dark:text-dark-button-primary focus:ring-light-focus-ring dark:focus:ring-dark-focus-ring"
        />
        <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
          Status
        </span>
      </div>
      <div className="col-span-2 flex items-center">
        <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
          Course
        </span>
      </div>
      <div className="col-span-4 flex items-center">
        <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
          Task
        </span>
      </div>
      <div className="col-span-4 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
          Due Date
        </span>
        <div className="flex items-center space-x-4">
          {showWeight && (
            <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
              Weight
            </span>
          )}
          <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
            Actions
          </span>
        </div>
      </div>
    </div>

    {/* Mobile Select All Header */}
    <div className="lg:hidden flex items-center justify-between p-3 bg-gray-100/50 dark:bg-dark-bg-tertiary/50 rounded-lg">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={onToggleSelectAll}
          className="h-5 w-5 rounded-sm border-gray-300 dark:border-dark-border-primary text-light-button-primary dark:text-dark-button-primary focus:ring-light-focus-ring dark:focus:ring-dark-focus-ring"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">
          Select All ({totalCount})
        </span>
      </div>
      <span className="text-xs text-gray-500 dark:text-dark-text-tertiary">
        {selectedCount} selected
      </span>
    </div>
  </>
);

export default TableHeader;
