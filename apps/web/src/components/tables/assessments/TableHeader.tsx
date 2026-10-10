import { Checkbox } from "../../ui/checkbox";
import { assessmentGridClass } from "./tableGrid";

interface TableHeaderProps {
  allSelected: boolean;
  onToggleSelectAll: () => void;
  totalCount: number;
  selectedCount: number;
  showWeight: boolean;
}

const headerLabelClass = "text-xs font-medium uppercase tracking-wider text-muted-foreground";

/** Desktop column headers plus the mobile select-all bar. */
const TableHeader = ({
  allSelected,
  onToggleSelectAll,
  totalCount,
  selectedCount,
  showWeight,
}: TableHeaderProps) => (
  <>
    {/* Desktop headers: same grid template as the rows, so every label sits over its column.
        The actions column has no label — the icon buttons are self-describing. */}
    <div className={`${assessmentGridClass(showWeight)} px-4 pb-2`}>
      <Checkbox
        checked={allSelected}
        onCheckedChange={onToggleSelectAll}
        aria-label="Select all assessments"
      />
      <span className={headerLabelClass}>Status</span>
      <span className={headerLabelClass}>Course</span>
      <span className={headerLabelClass}>Task</span>
      <span className={headerLabelClass}>Due date</span>
      {showWeight && <span className={`${headerLabelClass} text-right`}>Weight</span>}
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
