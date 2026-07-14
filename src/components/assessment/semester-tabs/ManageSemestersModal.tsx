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
import { Semester } from "@/types/semester";
import SortableSemester from "./SortableSemester";
import { CloseSolidIcon } from "../../ui/icons";

interface ManageSemestersModalProps {
  modalRef: React.RefObject<HTMLDivElement | null>;
  semesters: Semester[];
  selectedSemester: string;
  onClose: () => void;
  onAddFirst: () => void;
  onDragEnd: (event: DragEndEvent) => void;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

/** Modal for reordering (drag & drop), renaming, and deleting semesters. */
const ManageSemestersModal = ({
  modalRef,
  semesters,
  selectedSemester,
  onClose,
  onAddFirst,
  onDragEnd,
  onEdit,
  onDelete,
}: ManageSemestersModalProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <div className="modal-backdrop z-150 modal-open">
      <div ref={modalRef} className="modal-container w-full max-w-sm">
        <div className="modal-header">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-medium text-light-text-primary dark:text-dark-text-primary">
              Manage Semesters
            </h3>
            <button
              onClick={onClose}
              className="text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-secondary dark:hover:text-dark-text-secondary p-1 hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary rounded-md transition-colors"
            >
              <CloseSolidIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="modal-content">
          <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mb-4">
            Drag and drop to reorder semesters. Click the edit or delete icons to modify.
          </p>
          <div className="max-h-64 overflow-y-auto border border-light-border-primary dark:border-dark-border-primary rounded-md">
            {semesters.length === 0 ? (
              <div className="py-8 text-center text-light-text-tertiary dark:text-dark-text-tertiary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 mx-auto mb-2 text-light-text-tertiary dark:text-dark-text-tertiary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p>No semesters yet</p>
                <button
                  onClick={onAddFirst}
                  className="mt-2 text-light-button-primary dark:text-dark-button-primary hover:text-light-button-primary-hover dark:hover:text-dark-button-primary-hover font-medium"
                >
                  Add your first semester
                </button>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSemestersModal;
