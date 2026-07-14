// components/SemesterTabs.tsx
import React, { useState, useEffect, useRef } from "react";
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
import { Semester } from "@/types/semester";
import { SemesterTabsProps } from "@/types/course";
import ConfirmationModal from "../common/ConfirmationModal";
import { TrashOutlineIcon } from "../ui/icons";
import SemesterTabsSkeleton from "./semester-tabs/SemesterTabsSkeleton";
import AddSemesterInput from "./semester-tabs/AddSemesterInput";
import ManageSemestersModal from "./semester-tabs/ManageSemestersModal";
import { useSemesters } from "./semester-tabs/useSemesters";

const SemesterTabs = ({ selectedSemester, onSelect, className = "" }: SemesterTabsProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const [newSemester, setNewSemester] = useState("");
  const { semesters, setSemesters, isLoading, isDataReady } = useSemesters(
    user,
    selectedSemester,
    onSelect,
  );
  const [isAdding, setIsAdding] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [semesterToDelete, setSemesterToDelete] = useState<Semester | null>(null);

  const addInputRef = useRef<HTMLDivElement>(null);
  const moreOptionsRef = useRef<HTMLDivElement>(null);
  const manageModalRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close more options dropdown
      if (
        showMoreOptions &&
        moreOptionsRef.current &&
        !moreOptionsRef.current.contains(event.target as Node)
      ) {
        setShowMoreOptions(false);
      }

      // Close add input
      if (
        showAddInput &&
        addInputRef.current &&
        !addInputRef.current.contains(event.target as Node)
      ) {
        setShowAddInput(false);
        setNewSemester("");
      }

      // Close manage modal when clicking outside
      if (
        showManageModal &&
        manageModalRef.current &&
        !manageModalRef.current.contains(event.target as Node) &&
        !document.querySelector(".modal-open") // Don't close if another modal is open
      ) {
        setShowManageModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMoreOptions, showAddInput, showManageModal]);

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
      setShowAddInput(false);
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
    <div
      className={`semester-tabs-container mb-6 ${className} ${isDataReady ? "animate-fade-in-up" : "opacity-0"}`}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-light-border-primary dark:border-dark-border-primary">
        <div className="flex items-center space-x-2">
          <h2 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
            Semesters
          </h2>
        </div>
        <div className="flex items-center space-x-1">
          {/* Add button */}
          <button
            onClick={() => setShowAddInput(true)}
            className="p-1.5 text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-button-primary dark:hover:text-dark-button-primary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary rounded-md transition-colors"
            title="Add new semester"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* More options button */}
          <div className="relative" ref={moreOptionsRef}>
            <button
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="p-1.5 text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-button-primary dark:hover:text-dark-button-primary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary rounded-md transition-colors"
              title="More options"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </button>

            {showMoreOptions && (
              <div className="absolute right-0 top-full mt-1 bg-light-bg-primary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary rounded-md shadow-md z-20 animate-fade-in-down min-w-max">
                <button
                  onClick={() => {
                    setShowMoreOptions(false);
                    setShowManageModal(true);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-light-text-primary dark:text-dark-text-primary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary transition-colors whitespace-nowrap"
                >
                  Manage Semesters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Semester tabs - horizontally scrollable */}
      <div className="relative px-4 py-2">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 hide-scrollbar">
          {semesters.map((sem) => (
            <div key={sem.id} className="flex-shrink-0">
              <button
                onClick={() => handleSemesterSelect(sem.name)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  selectedSemester === sem.name
                    ? "bg-light-button-primary/10 text-light-button-primary dark:bg-dark-button-primary/10 dark:text-dark-button-primary"
                    : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary hover:text-light-text-primary dark:hover:text-dark-text-primary"
                }`}
              >
                {sem.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Empty state when no semesters exist */}
      {semesters.length === 0 && !showAddInput && (
        <div className="text-center py-3 text-light-text-tertiary dark:text-dark-text-tertiary text-sm">
          <p>No semesters yet. Click &ldquo;+&rdquo; to add one.</p>
        </div>
      )}

      {/* Add semester input */}
      {showAddInput && (
        <AddSemesterInput
          containerRef={addInputRef}
          value={newSemester}
          onChange={setNewSemester}
          onAdd={handleAddSemester}
          onCancel={() => {
            setShowAddInput(false);
            setNewSemester("");
          }}
          isAdding={isAdding}
        />
      )}

      {/* Manage Semesters Modal */}
      {showManageModal && (
        <ManageSemestersModal
          modalRef={manageModalRef}
          semesters={semesters}
          selectedSemester={selectedSemester}
          onClose={() => setShowManageModal(false)}
          onAddFirst={() => {
            setShowManageModal(false);
            setShowAddInput(true);
          }}
          onDragEnd={handleDragEnd}
          onEdit={handleEditSave}
          onDelete={handleDeleteSemester}
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
        title="Confirm Delete"
        message={`Are you sure you want to delete the semester "${semesterToDelete?.name}" and all its assessments? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        icon={<TrashOutlineIcon className="h-6 w-6" />}
      />

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
    </div>
  );
};

export default SemesterTabs;
