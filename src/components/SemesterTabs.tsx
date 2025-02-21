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

  // Listen for changes to the user's semesters in Firestore
  useEffect(() => {
    if (!user) return;
    const semColRef = collection(db, "users", user.uid, "semesters");
    const q = query(semColRef, orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sems: Semester[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        name: docSnap.data().name,
      }));
      setSemesters(sems);
    });
    return () => unsubscribe();
  }, [user]);

  // Add a new semester to Firestore
  const handleAddSemester = async () => {
    if (newSemester.trim() === "" || !user) return;
    try {
      const semColRef = collection(db, "users", user.uid, "semesters");
      await addDoc(semColRef, { name: newSemester.trim() });
      onSelect(newSemester.trim());
      setNewSemester("");
    } catch (error) {
      console.error("Error adding semester:", error);
    }
  };

  // Delete a semester from Firestore
  const handleDeleteSemester = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "semesters", id));
      // If the deleted semester was selected, clear the selection
      const deletedSem = semesters.find((sem) => sem.id === id);
      if (deletedSem && deletedSem.name === selectedSemester) {
        onSelect("");
      }
    } catch (error) {
      console.error("Error deleting semester:", error);
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
    if (!user) return;
    try {
      const semDocRef = doc(db, "users", user.uid, "semesters", id);
      await updateDoc(semDocRef, { name: editingName.trim() });
      // If the edited semester was selected, update the selection
      if (selectedSemester && selectedSemester !== editingName.trim()) {
        onSelect(editingName.trim());
      }
      setEditingId(null);
      setEditingName("");
    } catch (error) {
      console.error("Error updating semester:", error);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex space-x-4 items-center">
        {semesters.map((sem) => (
          <div key={sem.id} className="relative">
            {editingId === sem.id ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="border p-1 rounded"
                />
                <button
                  onClick={() => handleEditSave(sem.id)}
                  className="bg-blue-500 text-white px-2 py-1 rounded ml-2"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => onSelect(sem.name)}
                className={`relative px-4 py-2 rounded w-full text-left ${
                  selectedSemester === sem.name
                    ? "bg-blue-500 text-white"
                    : "bg-white border"
                }`}
              >
                {sem.name}
                {/* Three-dot icon positioned inside the button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpenId(
                      dropdownOpenId === sem.id ? null : sem.id
                    );
                  }}
                  className="absolute top-1 right-1 p-1"
                >
                  ⋮
                </button>
                {dropdownOpenId === sem.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white border rounded shadow-md z-10">
                    <button
                      onClick={() => handleEditStart(sem.id, sem.name)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSemester(sem.id)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2">
        <input
          type="text"
          placeholder="Add new semester"
          value={newSemester}
          onChange={(e) => setNewSemester(e.target.value)}
          className="border p-2 rounded mr-2"
        />
        <button
          onClick={handleAddSemester}
          className="bg-green-500 text-white px-3 py-2 rounded"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default SemesterTabs;
