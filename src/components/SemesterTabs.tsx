// components/SemesterTabs.tsx
import { useState, useEffect } from "react";
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
        return;
      }

      const docRef = await addDoc(semColRef, {
        name: semesterName,
        createdAt: new Date(),
      });

      onSelect(semesterName);
      setNewSemester("");
    } catch (error) {
      console.error("Error adding semester:", error);
      alert("Failed to add semester. Please try again.");
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
    return <div className="p-4">Loading semesters...</div>;
  }

  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-2 items-center">
        {semesters.map((sem) => (
          <div key={sem.id} className="relative">
            {editingId === sem.id ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => handleEditKeyPress(e, sem.id)}
                  autoFocus
                  className="border p-1 rounded"
                />
                <button
                  onClick={() => handleEditSave(sem.id)}
                  className="bg-blue-500 text-white px-2 py-1 rounded ml-2"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="bg-gray-300 text-gray-700 px-2 py-1 rounded ml-1"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="relative inline-block">
                <button
                  onClick={() => onSelect(sem.name)}
                  className={`relative px-4 py-2 rounded text-left ${
                    selectedSemester === sem.name
                      ? "bg-blue-500 text-white"
                      : "bg-white border"
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
                    className="ml-2 text-sm opacity-70 hover:opacity-100"
                    aria-label="Menu"
                  >
                    ⋮
                  </button>
                </button>

                {dropdownOpenId === sem.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white border rounded shadow-md z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditStart(sem.id, sem.name);
                      }}
                      className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSemester(sem.id);
                      }}
                      className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="flex">
          <input
            type="text"
            placeholder="Add new semester"
            value={newSemester}
            onChange={(e) => setNewSemester(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddSemester();
            }}
            className="border p-2 rounded mr-2 flex-grow"
          />
          <button
            onClick={handleAddSemester}
            className="bg-green-500 text-white px-3 py-2 rounded whitespace-nowrap"
          >
            Add Semester
          </button>
        </div>
      </div>
    </div>
  );
};

export default SemesterTabs;
