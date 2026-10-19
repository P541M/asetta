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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Semester } from "@/types/semester";
import SortableSemester from "./SortableSemester";

interface SortableSemesterListProps {
  semesters: Semester[];
  selectedSemester: string;
  /** The semesters in their new order, after a drag that moved one. */
  onReorder: (reordered: Semester[]) => void;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

/**
 * The drag-to-reorder list in Manage semesters. Its own chunk (dnd-kit), loaded with the modal
 * rather than with every dashboard page (A15).
 */
const SortableSemesterList = ({
  semesters,
  selectedSemester,
  onReorder,
  onEdit,
  onDelete,
}: SortableSemesterListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = semesters.findIndex((s) => s.id === active.id);
    const newIndex = semesters.findIndex((s) => s.id === over.id);
    onReorder(arrayMove(semesters, oldIndex, newIndex));
  };

  return (
    <>
      <p className="mb-2 text-xs text-muted-foreground">
        Drag to reorder. Rename or delete with the icons.
      </p>
      <div className="max-h-72 overflow-y-auto rounded-xl bg-secondary/50 p-1.5">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
  );
};

export default SortableSemesterList;
