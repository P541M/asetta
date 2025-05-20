// components/SemesterTabs.tsx
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  getDocs,
  writeBatch,
  limit,
  getDoc,
} from "firebase/firestore";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Semester {
  id: string;
  name: string;
}

interface SemesterTabsProps {
  selectedSemester: string;
  onSelect: (semester: string) => void;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  semesterName: string;
}

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  semesterName,
}: DeleteConfirmationModalProps) => {
  if (!isOpen) return null;

  const handleModalClick = (e: React.MouseEvent) => {
    // Prevent click from propagating to elements behind the modal
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200]"
      onClick={handleModalClick}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-scale">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Confirm Delete</h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete the semester &ldquo;{semesterName}
          &rdquo; and all its assessments? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="btn-outline py-1.5 px-4"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            className="btn-danger py-1.5 px-4"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Add drag handle component
const DragHandle = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 text-gray-400 dark:text-dark-text-tertiary cursor-move"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 9h8M8 15h8"
    />
  </svg>
);

// New SortableSemester component for drag-and-drop
function SortableSemester({
  semester,
  isSelected,
  onEdit,
  onDelete,
}: {
  semester: Semester;
  isSelected: boolean;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: semester.id });
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(semester.name);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleEditStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(semester.name);
  };

  const handleEditSave = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (editValue.trim() !== "") {
      onEdit(semester.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleEditCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditValue(semester.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      handleEditSave(e);
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(semester.name);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`py-2 px-4 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary flex items-center justify-between ${
        isDragging
          ? "bg-gray-50 dark:bg-dark-bg-tertiary shadow-lg rounded-lg"
          : ""
      }`}
    >
      <div className="flex items-center space-x-3 flex-grow">
        <div {...attributes} {...listeners}>
          <DragHandle />
        </div>
        {isEditing ? (
          <div className="flex items-center flex-grow">
            <input
              ref={editInputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input text-sm py-1 px-2 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border flex-grow min-w-0"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex items-center px-1">
              <button
                onClick={handleEditSave}
                className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
                title="Save"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={handleEditCancel}
                className="p-1.5 text-gray-500 dark:text-dark-text-tertiary hover:text-gray-700 dark:hover:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-md transition-colors ml-1"
                title="Cancel"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <>
            <span
              className={`font-medium ${
                isSelected
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "dark:text-dark-text-primary"
              }`}
            >
              {semester.name}
            </span>
            {isSelected && (
              <span className="inline-block bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400 text-xs px-2 py-0.5 rounded-full">
                Current
              </span>
            )}
          </>
        )}
      </div>
      {!isEditing && (
        <div className="flex items-center space-x-2">
          <button
            onClick={handleEditStart}
            className="text-gray-500 dark:text-dark-text-tertiary hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-dark-bg-secondary transition-colors"
            title="Edit"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(semester.id)}
            className="text-gray-500 dark:text-dark-text-tertiary hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-dark-bg-secondary transition-colors"
            title="Delete"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

const SemesterTabs = ({ selectedSemester, onSelect }: SemesterTabsProps) => {
  const { user } = useAuth();
  const [newSemester, setNewSemester] = useState("");
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [semesterToDelete, setSemesterToDelete] = useState<Semester | null>(
    null
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  const newInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
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

      // Close active semester dropdown
      if (
        activeDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
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
  }, [showMoreOptions, activeDropdown, showAddInput, showManageModal]);

  // Auto-focus inputs
  useEffect(() => {
    if (showAddInput && newInputRef.current) {
      newInputRef.current.focus();
    }
  }, [showAddInput]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  // Listen for changes to the user's semesters in Firestore
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const semColRef = collection(db, "users", user.uid, "semesters");
    const q = query(semColRef, orderBy("order", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const sems: Semester[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          name: docSnap.data().name,
        }));
        setSemesters(sems);
        setIsLoading(false);

        if (sems.length > 0 && !selectedSemester) {
          onSelect(sems[0].name);
        }
      },
      (error) => {
        console.error("Error listening to semesters:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, selectedSemester, onSelect]);

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
        (doc) => doc.data().name.toLowerCase() === semesterName.toLowerCase()
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

      // Select the newly created semester
      const newSemesterDoc = await getDoc(docRef);
      if (newSemesterDoc.exists()) {
        onSelect(newSemesterDoc.data().name);
      }
      setNewSemester("");
      setShowAddInput(false);
    } catch (error) {
      console.error("Error adding semester:", error);
      alert("Failed to add semester. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  // Add a migration effect to ensure all semesters have an order field
  useEffect(() => {
    const migrateSemesters = async () => {
      if (!user) return;

      try {
        const semColRef = collection(db, "users", user.uid, "semesters");
        const snapshot = await getDocs(semColRef);

        // Check if any semesters are missing the order field
        const needsMigration = snapshot.docs.some(
          (doc) => !doc.data().hasOwnProperty("order")
        );

        if (needsMigration) {
          const batch = writeBatch(db);
          snapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            if (!data.hasOwnProperty("order")) {
              batch.update(doc.ref, { order: index });
            }
          });
          await batch.commit();
          console.log("Migration completed: Added order field to semesters");
        }
      } catch (error) {
        console.error("Error during migration:", error);
      }
    };

    migrateSemesters();
  }, [user]);

  // Delete a semester from Firestore
  const handleDeleteSemester = (id: string) => {
    if (!user) return;

    const semToDelete = semesters.find((sem) => sem.id === id);
    if (!semToDelete) return;

    setSemesterToDelete(semToDelete);
    setShowDeleteModal(true);
    setActiveDropdown(null);
  };

  const handleConfirmDelete = async () => {
    if (!user || !semesterToDelete) return;

    try {
      const batch = writeBatch(db);
      const semDocRef = doc(
        db,
        "users",
        user.uid,
        "semesters",
        semesterToDelete.id
      );
      batch.delete(semDocRef);

      const assessmentsRef = collection(
        db,
        "users",
        user.uid,
        "semesters",
        semesterToDelete.id,
        "assessments"
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
            assessmentDoc.id
          )
        );
      });

      await batch.commit();

      if (semesterToDelete.name === selectedSemester) {
        if (semesters.length > 1) {
          const nextSemIndex =
            semesters.findIndex((s) => s.id === semesterToDelete.id) - 1;
          const nextSem = semesters[nextSemIndex >= 0 ? nextSemIndex : 1];
          onSelect(nextSem.id === semesterToDelete.id ? "" : nextSem.name);
        } else {
          onSelect("");
        }
      }

      setActiveDropdown(null);
      setShowDeleteModal(false);
      setSemesterToDelete(null);
    } catch (error) {
      console.error("Error deleting semester:", error);
      alert("Failed to delete semester. Please try again.");
    }
  };

  // Start editing a semester name
  const handleEditStart = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  // Update the semester name in Firestore
  const handleEditSave = async (id: string) => {
    if (!user || editingName.trim() === "") return;

    try {
      const updatedName = editingName.trim();
      const existingWithSameName = semesters.some(
        (sem) =>
          sem.id !== id && sem.name.toLowerCase() === updatedName.toLowerCase()
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

      setEditingId(null);
      setEditingName("");
    } catch (error) {
      console.error("Error updating semester:", error);
      alert("Failed to update semester name. Please try again.");
    }
  };

  // Handle Enter key press in edit input
  const handleEditKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      handleEditSave(id);
    } else if (e.key === "Escape") {
      setEditingId(null);
      setEditingName("");
    }
  };

  // Add dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Replace handleDragEnd with dnd-kit version
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

  if (isLoading) {
    return (
      <div className="mb-4 bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm p-4 border border-gray-100 dark:border-dark-border">
        <div className="flex justify-center py-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="semester-tabs-container mb-6 bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm p-4 border border-gray-100 dark:border-dark-border transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-medium text-gray-700 dark:text-dark-text-primary">
          Semesters
        </h2>
        <div className="flex items-center">
          {/* Add button */}
          <button
            onClick={() => setShowAddInput(true)}
            className="add-semester-button p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-dark-bg-tertiary rounded-md mr-1"
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
              className="p-1.5 text-gray-500 dark:text-dark-text-tertiary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-md"
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
              <div
                className="absolute right-0 top-full mt-1 bg-white dark:bg-dark-bg-secondary border border-gray-100 dark:border-dark-border rounded-md shadow-sm z-20 animate-fade-in-down"
                style={{ minWidth: "150px" }}
              >
                <button
                  onClick={() => {
                    setShowManageModal(true);
                    setShowMoreOptions(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary text-left rounded-t-md transition-colors duration-150 whitespace-nowrap dark:text-dark-text-primary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 mr-2 text-gray-600 dark:text-dark-text-tertiary flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                  </svg>
                  <span>Manage Semesters</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add semester input field */}
      {showAddInput && (
        <div ref={addInputRef} className="mb-3 animate-fade-in">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Add new semester"
              value={newSemester}
              onChange={(e) => setNewSemester(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSemester();
                if (e.key === "Escape") {
                  setShowAddInput(false);
                  setNewSemester("");
                }
              }}
              ref={newInputRef}
              className="input text-sm py-1.5 px-3 flex-grow dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border"
            />
            <button
              onClick={handleAddSemester}
              disabled={isAdding || !newSemester.trim()}
              className={`btn-primary text-sm py-1.5 px-3 ${
                isAdding || !newSemester.trim()
                  ? "opacity-60 cursor-not-allowed"
                  : ""
              }`}
            >
              {isAdding ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Add
                </span>
              ) : (
                "Add"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Semester tabs - horizontally scrollable */}
      <div className="relative">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 hide-scrollbar scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-dark-bg-tertiary scrollbar-track-transparent">
          {semesters.map((sem) => (
            <div key={sem.id} className="flex-shrink-0">
              {editingId === sem.id ? (
                <div className="flex items-center bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm border border-gray-200 dark:border-dark-border p-1 animate-fade-in">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => handleEditKeyPress(e, sem.id)}
                    ref={editInputRef}
                    className="input text-sm py-1 px-1.5 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border min-w-[120px]"
                  />
                  <div className="flex items-center px-1">
                    <button
                      onClick={() => handleEditSave(sem.id)}
                      className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
                      title="Save"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 text-gray-500 dark:text-dark-text-tertiary hover:text-gray-700 dark:hover:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-md transition-colors"
                      title="Cancel"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => onSelect(sem.name)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedSemester === sem.name
                      ? "bg-indigo-500 text-white shadow-sm hover:bg-indigo-600 hover:shadow"
                      : "bg-gray-100 dark:bg-dark-bg-tertiary text-gray-700 dark:text-dark-text-primary hover:bg-gray-200 dark:hover:bg-dark-bg-secondary"
                  }`}
                >
                  {sem.name}
                </button>
              )}
            </div>
          ))}
        </div>
        {semesters.length > 0 && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-dark-bg-secondary pointer-events-none"></div>
        )}
      </div>

      {/* Empty state when no semesters exist */}
      {semesters.length === 0 && !showAddInput && (
        <div className="text-center py-2 text-gray-500 dark:text-dark-text-tertiary text-sm">
          <p>No semesters yet. Click &ldquo;+&rdquo; to add one.</p>
        </div>
      )}

      {/* Manage Semesters Modal */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[150] modal-open">
          <div
            ref={manageModalRef}
            className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg p-4 w-full max-w-sm animate-scale"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-medium text-gray-900 dark:text-dark-text-primary">
                Manage Semesters
              </h3>
              <button
                onClick={() => setShowManageModal(false)}
                className="text-gray-400 dark:text-dark-text-tertiary hover:text-gray-600 dark:hover:text-dark-text-secondary p-1 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-md transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mb-3">
              Drag and drop to reorder semesters. Click the edit or delete icons
              to modify.
            </p>

            <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-dark-border rounded-md">
              {semesters.length === 0 ? (
                <div className="py-8 text-center text-gray-500 dark:text-dark-text-tertiary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 mx-auto mb-2 text-gray-400 dark:text-dark-text-tertiary"
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
                    onClick={() => {
                      setShowManageModal(false);
                      setShowAddInput(true);
                    }}
                    className="mt-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                  >
                    Add your first semester
                  </button>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
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
                        onEdit={(id, name) => handleEditStart(id, name)}
                        onDelete={(id) => handleDeleteSemester(id)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowManageModal(false);
                  setShowAddInput(true);
                }}
                className="btn-primary text-sm py-1.5 px-3 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Semester
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSemesterToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        semesterName={semesterToDelete?.name || ""}
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
