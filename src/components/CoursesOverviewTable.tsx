import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, getDocs, doc, setDoc } from "firebase/firestore";
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
  const [showOutline, setShowOutline] = useState<string | null>(null);

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
        const courseOutlines = new Map<string, string>();
        coursesSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.semesterId === semesterId) {
            courseOutlines.set(data.courseName, data.outlineUrl);
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
            outlineUrl: courseOutlines.get(courseName),
          });
        });

        setCourses(courseStatsList);
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
    if (!user || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }

    setUploadingCourse(courseName);
    setError(null);

    try {
      console.log('Starting upload to Supabase...');
      console.log('File:', file.name);
      console.log('User ID:', user.uid);
      console.log('Semester ID:', semesterId);

      // Create a safe filename by removing special characters and spaces
      const safeFileName = `${courseName}_${file.name}`
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/\s+/g, '_');
      
      // Create a simple path structure
      const filePath = `${user.uid}/${safeFileName}`;

      console.log('Upload path:', filePath);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('outlines')
        .upload(filePath, file, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('outlines')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      const courseDocRef = doc(
        db,
        "users",
        user.uid,
        "courses",
        `${semesterId}_${courseName}`
      );
      await setDoc(
        courseDocRef,
        {
          courseName,
          semesterId,
          outlineUrl: publicUrl,
          updatedAt: new Date(),
        },
        { merge: true }
      );

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
    setShowOutline(courseName);
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
                    <button
                      onClick={() => handleViewOutline(course.courseName)}
                      className="text-indigo-600 hover:text-indigo-800 p-1.5 hover:bg-indigo-50 rounded"
                      title="View Course Outline"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" />
                      </svg>
                    </button>
                  ) : (
                    <label className="relative cursor-pointer">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) =>
                          handleOutlineUpload(e, course.courseName)
                        }
                        className="hidden"
                        disabled={uploadingCourse === course.courseName}
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 text-gray-500 hover:text-indigo-600 ${
                          uploadingCourse === course.courseName
                            ? "animate-spin"
                            : ""
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
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
      {showOutline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl h-[80vh] flex flex-col animate-scale"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Course Outline for {showOutline}
              </h3>
              <button
                onClick={() => setShowOutline(null)}
                className="text-gray-400 hover:text-gray-600"
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
            <iframe
              src={courses.find(c => c.courseName === showOutline)?.outlineUrl}
              className="w-full flex-grow rounded-md border border-gray-200"
              title="Course Outline"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesOverviewTable;
