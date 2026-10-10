import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Loader2, Plus, X } from "lucide-react";
import { Semester } from "@/types/semester";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import SortableSemester from "./SortableSemester";

interface ManageSemestersModalProps {
  semesters: Semester[];
  selectedSemester: string;
  onClose: () => void;
  onDragEnd: (event: DragEndEvent) => void;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  /** Add flow lives inside this modal — one surface owns all semester management */
  addValue: string;
  onAddValueChange: (value: string) => void;
  onAdd: () => void;
  isAdding: boolean;
}

/** Single home for semesters: add, drag-reorder, rename, delete. */
const ManageSemestersModal = ({
  semesters,
  selectedSemester,
  onClose,
  onDragEnd,
  onEdit,
  onDelete,
  addValue,
  onAddValueChange,
  onAdd,
  isAdding,
}: ManageSemestersModalProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <div
      className="fixed inset-0 z-150 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-card shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-label="Manage semesters"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pb-1 pt-4">
          <h3 className="text-base font-semibold text-foreground">Semesters</h3>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground"
            onClick={onClose}
            aria-label="Close"
          >
            <X aria-hidden />
          </Button>
        </div>
        <div className="px-5 pb-5">
          <div className="mb-4 flex items-center gap-2">
            <Input
              value={addValue}
              onChange={(e) => onAddValueChange(e.target.value)}
              placeholder="New semester (e.g. Fall 2026)"
              className="h-10"
              autoFocus={semesters.length === 0}
              onKeyDown={(e) => {
                if (e.key === "Enter") onAdd();
              }}
            />
            <Button type="button" onClick={onAdd} disabled={isAdding || !addValue.trim()}>
              {isAdding ? <Loader2 className="animate-spin" aria-hidden /> : <Plus aria-hidden />}
              Add
            </Button>
          </div>

          {semesters.length === 0 ? (
            <div className="rounded-xl bg-secondary/50 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No semesters yet. Add your first one above.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-2 text-xs text-muted-foreground">
                Drag to reorder. Rename or delete with the icons.
              </p>
              <div className="max-h-72 overflow-y-auto rounded-xl bg-secondary/50 p-1.5">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={onDragEnd}
                >
                  <SortableContext
                    items={semesters.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {semesters.map((semester) => (
                      <SortableSemester
                        key={semester.id}
                        semester={semester}
                        isSelected={selectedSemester === semester.name}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageSemestersModal;
