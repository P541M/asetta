// components/SemesterTabs.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";
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
import { useSemesters } from "./semester-tabs/useSemesters";

const SemesterTabs = ({ selectedSemester, onSelect }: SemesterTabsProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const [newSemester, setNewSemester] = useState("");
  const { semesters, setSemesters, isLoading, isDataReady } = useSemesters(
    user,
    selectedSemester,
    onSelect,
  );
  const [isAdding, setIsAdding] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [semesterToDelete, setSemesterToDelete] = useState<Semester | null>(null);

  // Add a new semester to Firestore
  const handleAddSemester = async () => {
    if (newSemester.trim() === "" || !user) return;

    try {
      setIsAdding(true);
      const semesterName = newSemester.trim();
      const semColRef = collection(db, "users", user.uid, "semesters");
      const q = query(semColRef, orderBy("name"));
      const querySnapshot = await getDocs(q);

      const exists = querySnapshot.docs.some(
        (doc) => doc.data().name.toLowerCase() === semesterName.toLowerCase(),
      );

      if (exists) {
        alert(`Semester "${semesterName}" already exists.`);
        setIsAdding(false);
        return;
      }

      // Get the current highest order
      const orderQuery = query(semColRef, orderBy("order", "desc"), limit(1));
      const orderSnapshot = await getDocs(orderQuery);
      const currentHighestOrder = orderSnapshot.docs[0]?.data()?.order ?? -1;

      // Add the new semester with order = highest order + 1
      const docRef = await addDoc(semColRef, {
        name: semesterName,
        createdAt: new Date(),
        order: currentHighestOrder + 1,
      });

      // Navigate to the newly created semester's assessments page
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

  // Delete a semester from Firestore
  const handleDeleteSemester = (id: string) => {
    if (!user) return;

    const semToDelete = semesters.find((sem) => sem.id === id);
    if (!semToDelete) return;

    setSemesterToDelete(semToDelete);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!user || !semesterToDelete) return;

    try {
      const batch = writeBatch(db);
      const semDocRef = doc(db, "users", user.uid, "semesters", semesterToDelete.id);
      batch.delete(semDocRef);

      const assessmentsRef = collection(
        db,
        "users",
        user.uid,
        "semesters",
        semesterToDelete.id,
        "assessments",
      );

      const assessmentSnapshot = await getDocs(assessmentsRef);
      assessmentSnapshot.docs.forEach((assessmentDoc) => {
        batch.delete(
          doc(
            db,
            "users",
            user.uid,
            "semesters",
            semesterToDelete.id,
            "assessments",
            assessmentDoc.id,
          ),
        );
      });

      await batch.commit();

      if (semesterToDelete.name === selectedSemester) {
        if (semesters.length > 1) {
          const nextSemIndex = semesters.findIndex((s) => s.id === semesterToDelete.id) - 1;
          const nextSem = semesters[nextSemIndex >= 0 ? nextSemIndex : 1];
          onSelect(nextSem.id === semesterToDelete.id ? "" : nextSem.name);
        } else {
          onSelect("");
        }
      }

      setShowDeleteModal(false);
      setSemesterToDelete(null);
    } catch (error) {
      console.error("Error deleting semester:", error);
      alert("Failed to delete semester. Please try again.");
    }
  };

  // Update the semester name in Firestore
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

      const semDocRef = doc(db, "users", user.uid, "semesters", id);
      await updateDoc(semDocRef, {
        name: updatedName,
        updatedAt: new Date(),
      });

      const oldName = semesters.find((sem) => sem.id === id)?.name;
      if (selectedSemester === oldName) {
        onSelect(updatedName);
      }

      // Update local state
      setSemesters((prev) =>
        prev.map((sem) => (sem.id === id ? { ...sem, name: updatedName } : sem)),
      );
    } catch (error) {
      console.error("Error updating semester:", error);
      alert("Failed to update semester name. Please try again.");
    }
  };

  // Handle semester selection with navigation
  const handleSemesterSelect = (semesterName: string) => {
    const semester = semesters.find((s) => s.name === semesterName);
    if (semester) {
      // Check if we're already on a semester-specific page
      const currentPath = router.asPath;
      if (currentPath.startsWith("/dashboard/") && currentPath.includes("/")) {
        // We're on a semester page, navigate to the same page but for the new semester
        const pathParts = currentPath.split("/");
        if (pathParts.length >= 4) {
          // Replace the semester ID with the new one
          pathParts[2] = semester.id;
          router.push(pathParts.join("/"));
        } else {
          // Navigate to semester assessments (default landing)
          router.push(`/dashboard/${semester.id}/assessments`);
        }
      } else {
        // Navigate to semester assessments (default landing)
        router.push(`/dashboard/${semester.id}/assessments`);
      }
    }
    // Still call onSelect for backward compatibility
    onSelect(semesterName);
  };

  // Persist the new order after a drag-and-drop reorder
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = semesters.findIndex((s) => s.id === active.id);
    const newIndex = semesters.findIndex((s) => s.id === over.id);

    const newSemesters = arrayMove(semesters, oldIndex, newIndex);
    setSemesters(newSemesters);

    // Update order in Firestore
    if (user) {
      try {
        const batch = writeBatch(db);
        newSemesters.forEach((sem, index) => {
          const semRef = doc(db, "users", user.uid, "semesters", sem.id);
          batch.update(semRef, { order: index });
        });
        await batch.commit();
      } catch (error) {
        console.error("Error updating semester order:", error);
      }
    }
  };

  if (isLoading || !isDataReady) {
    return <SemesterTabsSkeleton />;
  }

  return (
    // The early skeleton return guarantees data is ready here; fade covers the swap
    <div className="mb-6 motion-safe:animate-fade-in">
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
              <span className="truncate">{selectedSemester || "Select semester"}</span>
            </span>
            <ChevronsUpDown className="text-muted-foreground" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-56">
          {semesters.length > 0 ? (
            semesters.map((sem) => (
              <DropdownMenuItem key={sem.id} onSelect={() => handleSemesterSelect(sem.name)}>
                <Check
                  className={cn(selectedSemester === sem.name ? "opacity-100" : "opacity-0")}
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
          selectedSemester={selectedSemester}
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

      {/* Delete Confirmation Modal */}
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
