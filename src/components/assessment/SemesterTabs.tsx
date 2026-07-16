import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";
import { useTab } from "../../contexts/TabContext";
import { db } from "../../lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  getDocs,
  writeBatch,
  limit,
} from "firebase/firestore";
import { arrayMove } from "@dnd-kit/sortable";
import { DragEndEvent } from "@dnd-kit/core";
import { Check, ChevronsUpDown, GraduationCap, Settings2 } from "lucide-react";
import { Semester } from "@/types/semester";
import { SemesterTabsProps } from "@/types/course";
import { cn } from "@/lib/utils";
import ConfirmationModal from "../common/ConfirmationModal";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import SemesterTabsSkeleton from "./semester-tabs/SemesterTabsSkeleton";
import ManageSemestersModal from "./semester-tabs/ManageSemestersModal";

const SemesterTabs = ({
  semesters,
  setSemesters,
  activeSemester,
  isLoading,
}: SemesterTabsProps) => {
  const { user } = useAuth();
  const { activeTab } = useTab();
  const router = useRouter();
  const [newSemester, setNewSemester] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [semesterToDelete, setSemesterToDelete] = useState<Semester | null>(null);

  const handleAddSemester = async () => {
    if (newSemester.trim() === "" || !user) return;

    try {
      setIsAdding(true);
      const semesterName = newSemester.trim();
      const semColRef = collection(db, "users", user.uid, "semesters");

      const exists = semesters.some((sem) => sem.name.toLowerCase() === semesterName.toLowerCase());
      if (exists) {
        alert(`Semester "${semesterName}" already exists.`);
        setIsAdding(false);
        return;
      }

      const orderQuery = query(semColRef, orderBy("order", "desc"), limit(1));
      const orderSnapshot = await getDocs(orderQuery);
      const currentHighestOrder = orderSnapshot.docs[0]?.data()?.order ?? -1;

      const docRef = await addDoc(semColRef, {
        name: semesterName,
        createdAt: new Date(),
        order: currentHighestOrder + 1,
      });

      router.push(`/dashboard/${docRef.id}/assessments`);
      setNewSemester("");
      setShowManageModal(false);
    } catch (error) {
      console.error("Error adding semester:", error);
      alert("Failed to add semester. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSemester = (id: string) => {
    const semToDelete = semesters.find((sem) => sem.id === id);
    if (!semToDelete) return;

    setSemesterToDelete(semToDelete);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!user || !semesterToDelete) return;

    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, "users", user.uid, "semesters", semesterToDelete.id));

      const assessmentsRef = collection(
        db,
        "users",
        user.uid,
        "semesters",
        semesterToDelete.id,
        "assessments",
      );
      const assessmentSnapshot = await getDocs(assessmentsRef);
      assessmentSnapshot.docs.forEach((assessmentDoc) => batch.delete(assessmentDoc.ref));

      await batch.commit();

      if (semesterToDelete.id === activeSemester?.id) {
        const next = semesters.find((sem) => sem.id !== semesterToDelete.id);
        router.push(next ? `/dashboard/${next.id}/${activeTab}` : "/dashboard/assessments");
      }

      setShowDeleteModal(false);
      setSemesterToDelete(null);
    } catch (error) {
      console.error("Error deleting semester:", error);
      alert("Failed to delete semester. Please try again.");
    }
  };

  const handleEditSave = async (id: string, newName: string) => {
    if (!user) return;

    try {
      const updatedName = newName.trim();
      const existingWithSameName = semesters.some(
        (sem) => sem.id !== id && sem.name.toLowerCase() === updatedName.toLowerCase(),
      );
      if (existingWithSameName) {
        alert(`Semester "${updatedName}" already exists.`);
        return;
      }

      await updateDoc(doc(db, "users", user.uid, "semesters", id), {
        name: updatedName,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating semester:", error);
      alert("Failed to update semester name. Please try again.");
    }
  };

  // Optimistic reorder: without the local set, rows snap back until the batch commits
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = semesters.findIndex((s) => s.id === active.id);
    const newIndex = semesters.findIndex((s) => s.id === over.id);
    const newSemesters = arrayMove(semesters, oldIndex, newIndex);
    setSemesters(newSemesters);

    if (user) {
      try {
        const batch = writeBatch(db);
        newSemesters.forEach((sem, index) => {
          batch.update(doc(db, "users", user.uid, "semesters", sem.id), { order: index });
        });
        await batch.commit();
      } catch (error) {
        console.error("Error updating semester order:", error);
      }
    }
  };

  if (isLoading) {
    return <SemesterTabsSkeleton />;
  }

  return (
    <div className="mb-6">
      {/* One switcher instead of pill clutter: current semester + everything else in the menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            className="min-w-44 justify-between md:min-w-56"
            aria-label="Switch semester"
          >
            <span className="flex min-w-0 items-center gap-2">
              <GraduationCap className="text-muted-foreground" aria-hidden />
              <span className="truncate">{activeSemester?.name ?? "Select semester"}</span>
            </span>
            <ChevronsUpDown className="text-muted-foreground" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-56">
          {semesters.length > 0 ? (
            semesters.map((sem) => (
              <DropdownMenuItem
                key={sem.id}
                onSelect={() => router.push(`/dashboard/${sem.id}/${activeTab}`)}
              >
                <Check
                  className={cn(activeSemester?.id === sem.id ? "opacity-100" : "opacity-0")}
                  aria-hidden
                />
                <span className="truncate">{sem.name}</span>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuLabel>No semesters yet</DropdownMenuLabel>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setShowManageModal(true)}>
            <Settings2 aria-hidden />
            Manage semesters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* One surface owns all semester management: add, reorder, rename, delete */}
      {showManageModal && (
        <ManageSemestersModal
          semesters={semesters}
          selectedSemester={activeSemester?.name ?? ""}
          onClose={() => {
            setShowManageModal(false);
            setNewSemester("");
          }}
          onDragEnd={handleDragEnd}
          onEdit={handleEditSave}
          onDelete={handleDeleteSemester}
          addValue={newSemester}
          onAddValueChange={setNewSemester}
          onAdd={handleAddSemester}
          isAdding={isAdding}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSemesterToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete semester"
        message={`Are you sure you want to delete the semester "${semesterToDelete?.name}" and all its assessments? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default SemesterTabs;
