import { Checkbox } from "../../ui/checkbox";

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
    <div className="hidden lg:grid grid-cols-12 gap-2 px-4 pb-2">
      <div className="col-span-2 flex items-center gap-3">
        <Checkbox
          checked={allSelected}
          onCheckedChange={onToggleSelectAll}
          aria-label="Select all assessments"
        />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Status
        </span>
      </div>
      <div className="col-span-2 flex items-center">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Course
        </span>
      </div>
      <div className="col-span-4 flex items-center">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Task
        </span>
      </div>
      <div className="col-span-4 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Due date
        </span>
        <div className="flex items-center gap-4">
          {showWeight && (
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Weight
            </span>
          )}
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Actions
          </span>
        </div>
      </div>
    </div>

    {/* Mobile Select All Header */}
    <div className="lg:hidden flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={allSelected}
          onCheckedChange={onToggleSelectAll}
          aria-label="Select all assessments"
        />
        <span className="text-sm font-medium text-foreground">Select all ({totalCount})</span>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{selectedCount} selected</span>
    </div>
  </>
);

export default TableHeader;
