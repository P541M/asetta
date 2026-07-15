import { Check, X } from "lucide-react";
import { Assessment, AssessmentStatus } from "@/types/assessment";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import StatusSelect from "./StatusSelect";

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
  <div className="rounded-xl bg-secondary/50 p-4 motion-safe:animate-fade-in">
    {/* Mobile Edit Form */}
    <div className="lg:hidden space-y-4">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
          aria-label={`Select ${editFormData.assignmentName}`}
        />
        <div className="flex-1">
          <StatusSelect value={editFormData.status} onChange={onStatusChange} size="md" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="edit-course">Course</Label>
          <Input
            id="edit-course"
            type="text"
            name="courseName"
            value={editFormData.courseName}
            onChange={onFieldChange}
            placeholder="Course name"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-assignment">Assignment</Label>
          <Input
            id="edit-assignment"
            type="text"
            name="assignmentName"
            value={editFormData.assignmentName}
            onChange={onFieldChange}
            placeholder="Assignment name"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit-due-date">Due date</Label>
            <Input
              id="edit-due-date"
              type="date"
              name="dueDate"
              value={editFormData.dueDate}
              onChange={onFieldChange}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-due-time">Due time</Label>
            <Input
              id="edit-due-time"
              type="time"
              name="dueTime"
              value={editFormData.dueTime}
              onChange={onFieldChange}
            />
          </div>
        </div>

        {showWeight && (
          <div className="space-y-1.5">
            <Label htmlFor="edit-weight">Weight (%)</Label>
            <Input
              id="edit-weight"
              type="number"
              name="weight"
              value={editFormData.weight}
              onChange={onFieldChange}
              min="0"
              max="100"
              step="0.1"
              placeholder="Weight"
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel} className="min-w-20">
          Cancel
        </Button>
        <Button onClick={onSave} className="min-w-20">
          Save
        </Button>
      </div>
    </div>

    {/* Desktop Edit Form */}
    <div className="hidden lg:grid grid-cols-12 gap-2 items-center">
      <div className="col-span-2 flex items-center gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
          aria-label={`Select ${editFormData.assignmentName}`}
        />
        <StatusSelect
          value={editFormData.status}
          onChange={onStatusChange}
          className="min-w-0 flex-1"
        />
      </div>
      <div className="col-span-2">
        <Input
          type="text"
          name="courseName"
          value={editFormData.courseName}
          onChange={onFieldChange}
          placeholder="Course name"
          aria-label="Course name"
        />
      </div>
      <div className="col-span-4">
        <Input
          type="text"
          name="assignmentName"
          value={editFormData.assignmentName}
          onChange={onFieldChange}
          placeholder="Assignment name"
          aria-label="Assignment name"
        />
      </div>
      <div className="col-span-4 flex items-center gap-2">
        <Input
          type="date"
          name="dueDate"
          value={editFormData.dueDate}
          onChange={onFieldChange}
          aria-label="Due date"
          className="flex-1"
        />
        <Input
          type="time"
          name="dueTime"
          value={editFormData.dueTime}
          onChange={onFieldChange}
          aria-label="Due time"
          className="w-24"
        />
        {showWeight && (
          <Input
            type="number"
            name="weight"
            value={editFormData.weight}
            onChange={onFieldChange}
            min="0"
            max="100"
            step="0.1"
            placeholder="Weight"
            aria-label="Weight (%)"
            className="w-20"
          />
        )}
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon-sm" onClick={onSave} title="Save" aria-label="Save">
            <Check className="text-success" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onCancel}
            title="Cancel"
            aria-label="Cancel"
          >
            <X className="text-muted-foreground" />
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export default AssessmentEditRow;
