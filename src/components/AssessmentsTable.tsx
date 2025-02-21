// components/AssessmentsTable.tsx
import { useState } from "react";

interface Assessment {
  courseName: string;
  assignmentName: string;
  dueDate: string;
  weight: number;
  status: string;
}

interface AssessmentsTableProps {
  assessments: Assessment[];
}

const AssessmentsTable = ({ assessments }: AssessmentsTableProps) => {
  const [sortKey, setSortKey] = useState<keyof Assessment>("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const sortedAssessments = [...assessments].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortOrder === "asc" ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key: keyof Assessment) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="overflow-x-auto bg-white p-4 rounded shadow-md">
      <table className="min-w-full">
        <thead>
          <tr>
            <th
              onClick={() => handleSort("courseName")}
              className="cursor-pointer px-4 py-2"
            >
              Course Name
            </th>
            <th
              onClick={() => handleSort("assignmentName")}
              className="cursor-pointer px-4 py-2"
            >
              Task
            </th>
            <th className="px-4 py-2">Status</th>
            <th
              onClick={() => handleSort("dueDate")}
              className="cursor-pointer px-4 py-2"
            >
              Due Date
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedAssessments.map((assessment, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{assessment.courseName}</td>
              <td className="px-4 py-2">{assessment.assignmentName}</td>
              <td className="px-4 py-2">{assessment.status}</td>
              <td className="px-4 py-2">{assessment.dueDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssessmentsTable;
