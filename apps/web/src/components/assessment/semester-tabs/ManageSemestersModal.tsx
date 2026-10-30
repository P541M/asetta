import dynamic, { type DynamicOptionsLoadingProps } from "next/dynamic";
import { Loader2, Plus, X } from "lucide-react";
import { Semester } from "@/types/semester";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import LoadingSpinner from "../../ui/LoadingSpinner";
import { useScrollLock } from "../../../hooks/useScrollLock";

/** The list's chunk (dnd-kit). SemesterTabs fetches it when the semester menu opens (A15). */
export const loadSortableSemesterList = () => import("./SortableSemesterList");

/** The list still loading: nothing for the first 200 ms, then a spinner. */
const ListLoading = ({ error, pastDelay, retry }: DynamicOptionsLoadingProps) => {
  if (error) {
    return (
      <div className="rounded-xl bg-secondary/50 px-3 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          Couldn&apos;t load your semesters. Check your internet connection, then try again.
        </p>
        <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={retry}>
          Try again
        </Button>
      </div>
    );
  }
  if (!pastDelay) return null;
  return (
    <div className="flex justify-center rounded-xl bg-secondary/50 py-6">
      <LoadingSpinner size="sm" />
    </div>
  );
};

const SortableSemesterList = dynamic(loadSortableSemesterList, {
  ssr: false,
  loading: ListLoading,
});

interface ManageSemestersModalProps {
  semesters: Semester[];
  selectedSemester: string;
  onClose: () => void;
  onReorder: (reordered: Semester[]) => void;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  /** Add flow lives inside this modal: one surface owns all semester management */
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
  onReorder,
  onEdit,
  onDelete,
  addValue,
  onAddValueChange,
  onAdd,
  isAdding,
}: ManageSemestersModalProps) => {
  useScrollLock();

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
            <SortableSemesterList
              semesters={semesters}
              selectedSemester={selectedSemester}
              onReorder={onReorder}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageSemestersModal;
