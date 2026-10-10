import { Button } from "../../ui/button";
import StatusSelect from "./StatusSelect";

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
  <div className="mb-4 rounded-xl bg-primary/10 p-4 motion-safe:animate-fade-in">
    {/* Mobile Layout */}
    <div className="lg:hidden space-y-4">
      <p className="text-center text-sm font-medium text-primary">
        {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
      </p>

      {!showBulkStatusUpdate ? (
        <StatusSelect value={null} onChange={onStatusSelect} placeholder="Update status" />
      ) : (
        <div className="space-y-3">
          <p className="text-center text-sm text-foreground">
            Update to <span className="font-medium">{selectedStatus}</span>
          </p>
          <div className="flex gap-2">
            <Button onClick={onConfirmStatusUpdate} className="flex-1">
              Confirm
            </Button>
            <Button variant="secondary" onClick={onCancelStatusUpdate} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button variant="destructive" onClick={onDeleteSelected}>
          Delete selected
        </Button>
        <Button variant="ghost" onClick={onClearSelection}>
          Clear selection
        </Button>
      </div>
    </div>

    {/* Desktop Layout */}
    <div className="hidden lg:flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-primary">
          {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
        </span>
        {!showBulkStatusUpdate ? (
          <StatusSelect
            value={null}
            onChange={onStatusSelect}
            size="sm"
            placeholder="Update status"
          />
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground">
              Update to <span className="font-medium">{selectedStatus}</span>
            </span>
            <Button size="sm" onClick={onConfirmStatusUpdate}>
              Confirm
            </Button>
            <Button variant="secondary" size="sm" onClick={onCancelStatusUpdate}>
              Cancel
            </Button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="destructive" size="sm" onClick={onDeleteSelected}>
          Delete selected
        </Button>
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          Clear selection
        </Button>
      </div>
    </div>
  </div>
);

export default BulkActionsBar;
