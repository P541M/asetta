// components/SemesterTabs.tsx
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  getDocs,
  writeBatch,
} from "firebase/firestore";

interface Semester {
  id: string;
  name: string;
}

interface SemesterTabsProps {
  selectedSemester: string;
  onSelect: (semester: string) => void;
}

const SemesterTabs = ({ selectedSemester, onSelect }: SemesterTabsProps) => {
  const { user } = useAuth();
  const [newSemester, setNewSemester] = useState("");
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const newInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-focus on the new semester input when triggered
  useEffect(() => {
    if (newSemester === "" && newInputRef.current) {
      newInputRef.current.focus();
    }
  }, [newSemester]);

  // Auto-focus on the edit input when editing starts
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
    const q = query(semColRef, orderBy("name"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const sems: Semester[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          name: docSnap.data().name,
        }));
        setSemesters(sems);
        setIsLoading(false);
        // If there are semesters but none selected, select the first one
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
      // Check if semester already exists
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
      const docRef = await addDoc(semColRef, {
        name: semesterName,
        createdAt: new Date(),
      });
      onSelect(semesterName);
      setNewSemester("");
      setLastAdded(docRef.id);

      // Clear the "last added" highlight after 2 seconds
      setTimeout(() => {
        setLastAdded(null);
      }, 2000);
    } catch (error) {
      console.error("Error adding semester:", error);
      alert("Failed to add semester. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  // Delete a semester from Firestore
  const handleDeleteSemester = async (id: string) => {
    if (!user) return;
    // Find the semester to delete
    const semToDelete = semesters.find((sem) => sem.id === id);
    if (!semToDelete) return;
    // Confirm deletion
    const confirm = window.confirm(
      `Are you sure you want to delete the semester "${semToDelete.name}" and all its assessments? This action cannot be undone.`
    );
    if (!confirm) return;
    try {
      // Start a batch operation
      const batch = writeBatch(db);
      // Delete the semester document
      const semDocRef = doc(db, "users", user.uid, "semesters", id);
      batch.delete(semDocRef);
      // Delete all assessments for this semester
      const assessmentsRef = collection(
        db,
        "users",
        user.uid,
        "semesters",
        id,
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
            id,
            "assessments",
            assessmentDoc.id
          )
        );
      });
      // Commit the batch
      await batch.commit();
      // If the deleted semester was selected, clear the selection
      if (semToDelete.name === selectedSemester) {
        if (semesters.length > 1) {
          // Find the next semester to select
          const nextSemIndex = semesters.findIndex((s) => s.id === id) - 1;
          const nextSem = semesters[nextSemIndex >= 0 ? nextSemIndex : 1];
          onSelect(nextSem.id === id ? "" : nextSem.name);
        } else {
          onSelect("");
        }
      }
    } catch (error) {
      console.error("Error deleting semester:", error);
      alert("Failed to delete semester. Please try again.");
    }
  };

  // Start editing a semester name
  const handleEditStart = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
    setDropdownOpenId(null); // close dropdown if open
  };

  // Update the semester name in Firestore
  const handleEditSave = async (id: string) => {
    if (!user || editingName.trim() === "") return;
    try {
      const updatedName = editingName.trim();
      // Check if the name already exists (excluding the current semester)
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
      // If the edited semester was selected, update the selection
      const oldName = semesters.find((sem) => sem.id === id)?.name;
      if (selectedSemester === oldName) {
        onSelect(updatedName);
      }
      setEditingId(null);
      setEditingName("");

      // Highlight the updated semester temporarily
      setLastAdded(id);
      setTimeout(() => {
        setLastAdded(null);
      }, 2000);
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

  if (isLoading) {
    return (
      <div className="mb-6 bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all duration-300">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Semesters</h2>
      <div className="flex flex-wrap gap-2 items-center mb-4">
        {semesters.map((sem) => (
          <div key={sem.id} className="relative animate-scale">
            {editingId === sem.id ? (
              <div className="flex items-center bg-white rounded-lg shadow-sm p-1 animate-fade-in">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => handleEditKeyPress(e, sem.id)}
                  ref={editInputRef}
                  className="input py-1 px-2"
                />
                <button
                  onClick={() => handleEditSave(sem.id)}
                  className="ml-2 p-1 text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
                  title="Save"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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
                  className="p-1 text-gray-600 hover:text-gray-700 transition-colors duration-200"
                  title="Cancel"
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
            ) : (
              <div
                className="relative inline-block"
                ref={dropdownOpenId === sem.id ? dropdownRef : null}
              >
                <button
                  onClick={() => onSelect(sem.name)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    selectedSemester === sem.name
                      ? "bg-indigo-500 text-white shadow-sm transform scale-105"
                      : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-200 hover:-translate-y-0.5"
                  } ${
                    lastAdded === sem.id
                      ? "animate-pulse border-indigo-300"
                      : ""
                  }`}
                >
                  {sem.name}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpenId(
                        dropdownOpenId === sem.id ? null : sem.id
                      );
                    }}
                    className="ml-2 text-sm opacity-70 hover:opacity-100 transition-opacity duration-200"
                    aria-label="Menu"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 inline transition-transform duration-200 ${
                        dropdownOpenId === sem.id ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </button>
                {dropdownOpenId === sem.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-lg shadow-sm z-10 min-w-32 animate-fade-in-down">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditStart(sem.id, sem.name);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50 text-left rounded-t-lg transition-colors duration-150"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2 text-gray-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSemester(sem.id);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm hover:bg-red-50 text-left text-red-600 rounded-b-lg transition-colors duration-150"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2 text-red-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Add new semester"
            value={newSemester}
            onChange={(e) => setNewSemester(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddSemester();
            }}
            ref={newInputRef}
            className="input pr-10 transition-all duration-200 hover:shadow-sm focus:shadow"
          />
          {newSemester && (
            <button
              onClick={() => setNewSemester("")}
              className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={handleAddSemester}
          disabled={isAdding || !newSemester.trim()}
          className={`btn-accent flex items-center whitespace-nowrap hover:shadow hover:-translate-y-0.5 transition-all duration-300 ${
            isAdding || !newSemester.trim()
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          {isAdding ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              Adding...
            </>
          ) : (
            <>
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
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SemesterTabs;
