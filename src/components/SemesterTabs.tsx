// components/SemesterTabs.tsx
import { useState } from "react";

interface SemesterTabsProps {
  selectedSemester: string;
  onSelect: (semester: string) => void;
}

const SemesterTabs = ({ selectedSemester, onSelect }: SemesterTabsProps) => {
  const [newSemester, setNewSemester] = useState("");
  const [semesters, setSemesters] = useState<string[]>([]);

  const handleAddSemester = () => {
    if (newSemester.trim() !== "") {
      setSemesters([...semesters, newSemester]);
      onSelect(newSemester);
      setNewSemester("");
    }
  };

  return (
    <div className="mb-4">
      <div className="flex space-x-4">
        {semesters.map((sem) => (
          <button
            key={sem}
            onClick={() => onSelect(sem)}
            className={`px-4 py-2 rounded ${
              selectedSemester === sem
                ? "bg-blue-500 text-white"
                : "bg-white border"
            }`}
          >
            {sem}
          </button>
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
