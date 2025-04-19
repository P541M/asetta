import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, getDocs, doc, setDoc, writeBatch, where } from "firebase/firestore";
import { supabase } from "../lib/supabase";

interface Assessment {
  id: string;
  courseName: string;
  assignmentName: string;
  dueDate: string;
  weight: number;
  status: string;
}

interface CourseStats {
  courseName: string;
  totalAssessments: number;
  pendingAssessments: number;
  completedAssessments: number;
  nextDueDate: string | null;
  nextAssignment: string | null;
  progress: number;
  outlineUrl?: string;
}

interface CoursesOverviewTableProps {
  semesterId: string;
  onSelectCourse: (courseName: string) => void;
}

const CoursesOverviewTable = ({
  semesterId,
  onSelectCourse,
}: CoursesOverviewTableProps) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof CourseStats>("courseName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [uploadingCourse, setUploadingCourse] = useState<string | null>(null);
  const [selectedOutline, setSelectedOutline] = useState<string | null>(null);
  const [outlineUrls, setOutlineUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!user || !semesterId) {
        setCourses([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const assessmentsRef = collection(
          db,
          "users",
          user.uid,
          "semesters",
          semesterId,
          "assessments"
        );
        const querySnapshot = await getDocs(query(assessmentsRef));
        const assessmentsList: Assessment[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Assessment, "id">),
        }));

        const courseMap = new Map<string, Assessment[]>();
        assessmentsList.forEach((assessment) => {
          if (!courseMap.has(assessment.courseName)) {
            courseMap.set(assessment.courseName, []);
          }
          courseMap.get(assessment.courseName)?.push(assessment);
        });

        const coursesRef = collection(db, "users", user.uid, "courses");
        const coursesSnapshot = await getDocs(query(coursesRef));
        const courseOutlines: Record<string, string> = {};
        coursesSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.semesterId === semesterId) {
            courseOutlines[data.courseName] = data.outlineUrl;
          }
        });

        const courseStatsList: CourseStats[] = [];
        courseMap.forEach((assessments, courseName) => {
          const completedStatuses = ["Submitted", "Under Review", "Completed"];
          const completed = assessments.filter((a) =>
            completedStatuses.includes(a.status)
          );
          const now = new Date();
          const upcomingAssessments = assessments
            .filter(
              (a) =>
                !completedStatuses.includes(a.status) &&
                new Date(a.dueDate) >= now
            )
            .sort(
              (a, b) =>
                new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            );
          const nextAssignment = upcomingAssessments[0] || null;

          courseStatsList.push({
            courseName,
            totalAssessments: assessments.length,
            pendingAssessments: assessments.length - completed.length,
            completedAssessments: completed.length,
            nextDueDate: nextAssignment ? nextAssignment.dueDate : null,
            nextAssignment: nextAssignment
              ? nextAssignment.assignmentName
              : null,
            progress:
              assessments.length > 0
                ? Math.round((completed.length / assessments.length) * 100)
                : 0,
            outlineUrl: courseOutlines[courseName],
          });
        });

        setCourses(courseStatsList);
        setOutlineUrls(courseOutlines);
      } catch (err) {
        console.error("Error fetching course data:", err);
        setError("Failed to load course overview data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [user, semesterId]);

  const handleSort = (field: keyof CourseStats) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedCourses = [...courses].sort((a, b) => {
    if (sortField === "nextDueDate") {
      if (!a.nextDueDate && !b.nextDueDate) return 0;
      if (!a.nextDueDate) return sortDirection === "asc" ? 1 : -1;
      if (!b.nextDueDate) return sortDirection === "asc" ? -1 : 1;
      const dateA = new Date(a.nextDueDate);
      const dateB = new Date(b.nextDueDate);
      return sortDirection === "asc"
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    }
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isUpcoming = (dateStr: string | null) => {
    if (!dateStr) return false;
    const now = new Date();
    const dueDate = new Date(dateStr);
    const diffDays = Math.round(
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays >= 0 && diffDays <= 7;
  };

  const handleOutlineUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    courseName: string
  ) => {
    if (!user || !e.target.files || !e.target.files[0]) return;
    setUploadingCourse(courseName);
    setError(null);

    try {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        throw new Error("Please upload a PDF file");
      }

      // Create a safe filename
      const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = `${user.uid}/${semesterId}/${safeFilename}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("outlines")
        .upload(filePath, file, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from("outlines")
        .getPublicUrl(filePath);

      // Update the course document
      const courseRef = doc(db, "users", user.uid, "courses", courseName);
      await setDoc(courseRef, {
        courseName,
        semesterId,
        outlineUrl: publicUrl,
        updatedAt: new Date(),
      });

      // Update all assessments for this course with the new outline URL
      const assessmentsRef = collection(
        db,
        "users",
        user.uid,
        "semesters",
        semesterId,
        "assessments"
      );
      const q = query(assessmentsRef, where("courseName", "==", courseName));
      const querySnapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, { outlineUrl: publicUrl });
      });
      await batch.commit();

      // Update local state
      setOutlineUrls((prev) => ({
        ...prev,
        [courseName]: publicUrl,
      }));

      setCourses((prev) =>
        prev.map((course) =>
          course.courseName === courseName ? { ...course, outlineUrl: publicUrl } : course
        )
      );
    } catch (err) {
      console.error("Error uploading outline:", err);
      setError(`Failed to upload course outline: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUploadingCourse(null);
      if (e.target) e.target.value = "";
    }
  };

  const handleViewOutline = (courseName: string) => {
    setSelectedOutline(courseName);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (courses.length === 0) return <div>No courses found.</div>;

  return (
    <div>
      <h2 className="text-xl font-medium text-gray-900 mb-6">Your Courses</h2>
      <div className="table-container rounded-lg shadow-sm border border-gray-100">
        <table className="data-table">
          <thead>
            <tr>
              <th
                onClick={() => handleSort("courseName")}
                className="cursor-pointer"
              >
                <div className="flex items-center space-x-1 group">
                  <span className="group-hover:text-indigo-600">Course</span>
                  {sortField === "courseName" && (
                    <span className="text-indigo-600">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort("totalAssessments")}
                className="cursor-pointer"
              >
                <div className="flex items-center space-x-1 group">
                  <span className="group-hover:text-indigo-600">Total</span>
                  {sortField === "totalAssessments" && (
                    <span className="text-indigo-600">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort("pendingAssessments")}
                className="cursor-pointer"
              >
                <div className="flex items-center space-x-1 group">
                  <span className="group-hover:text-indigo-600">Pending</span>
                  {sortField === "pendingAssessments" && (
                    <span className="text-indigo-600">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort("progress")}
                className="cursor-pointer"
              >
                <div className="flex items-center space-x-1 group">
                  <span className="group-hover:text-indigo-600">Progress</span>
                  {sortField === "progress" && (
                    <span className="text-indigo-600">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort("nextDueDate")}
                className="cursor-pointer"
              >
                <div className="flex items-center space-x-1 group">
                  <span className="group-hover:text-indigo-600">Next Due</span>
                  {sortField === "nextDueDate" && (
                    <span className="text-indigo-600">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th className="text-center">Outline</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCourses.map((course) => (
              <tr key={course.courseName}>
                <td className="font-medium">{course.courseName}</td>
                <td>{course.totalAssessments}</td>
                <td>
                  {course.pendingAssessments > 0 ? (
                    <span
                      className={`font-medium ${
                        course.pendingAssessments > 2 ? "text-amber-600" : ""
                      }`}
                    >
                      {course.pendingAssessments}
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-medium">
                      All done!
                    </span>
                  )}
                </td>
                <td>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full bg-indigo-600"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 inline-block">
                    {course.progress}% complete
                  </span>
                </td>
                <td>
                  {course.nextDueDate ? (
                    <div>
                      <div
                        className={`font-medium ${
                          isUpcoming(course.nextDueDate) ? "text-amber-600" : ""
                        }`}
                      >
                        {formatDate(course.nextDueDate)}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-[200px]">
                        {course.nextAssignment}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="text-center">
                  {course.outlineUrl ? (
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleViewOutline(course.courseName)}
                        className="group flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 p-1.5 hover:bg-indigo-50 rounded transition-all duration-200"
                        title="View Course Outline"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          View
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'application/pdf';
                          input.onchange = (e) => handleOutlineUpload(e as any, course.courseName);
                          input.click();
                        }}
                        className="text-gray-400 hover:text-indigo-600 p-1.5 hover:bg-gray-50 rounded transition-all duration-200"
                        title="Update Outline"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="relative cursor-pointer group">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => handleOutlineUpload(e, course.courseName)}
                        className="hidden"
                        disabled={uploadingCourse === course.courseName}
                      />
                      <div className="flex items-center justify-center space-x-1 text-gray-400 group-hover:text-indigo-600 p-1.5 group-hover:bg-gray-50 rounded transition-all duration-200">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-5 w-5 ${
                            uploadingCourse === course.courseName ? "animate-spin" : ""
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          Upload
                        </span>
                      </div>
                    </label>
                  )}
                </td>
                <td className="text-center">
                  <button
                    onClick={() => onSelectCourse(course.courseName)}
                    className="btn-primary py-1 px-3 text-sm hover:shadow-sm flex items-center justify-center mx-auto"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Outline Viewer Modal */}
      {selectedOutline && outlineUrls[selectedOutline] && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-[80vw] h-[95vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedOutline} Course Outline
                </h3>
                <p className="text-sm text-gray-500">
                  View and navigate through the course outline
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.open(outlineUrls[selectedOutline], '_blank')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  Open in New Tab
                </button>
                <label className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleOutlineUpload(e, selectedOutline)}
                    className="hidden"
                    disabled={uploadingCourse === selectedOutline}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  {uploadingCourse === selectedOutline ? "Uploading..." : "Reupload"}
                </label>
                <button
                  onClick={() => setSelectedOutline(null)}
                  className="inline-flex items-center p-2 border border-transparent rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-hidden">
              <div className="w-full h-full bg-gray-50 rounded-lg overflow-hidden">
                <iframe
                  src={outlineUrls[selectedOutline]}
                  className="w-full h-full"
                  title={`${selectedOutline} Course Outline`}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesOverviewTable;
