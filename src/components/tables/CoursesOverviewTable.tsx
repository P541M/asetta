import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import {
  collection,
  query,
  getDocs,
  doc,
  setDoc,
  writeBatch,
  where,
} from "firebase/firestore";
import { supabase } from "../../lib/supabase";
import {
  formatLocalDate,
  isUpcoming as isDateUpcoming,
} from "../../utils/dateUtils";
import { CourseStats, CoursesOverviewTableProps } from "../../types/course";
import { Assessment } from "../../types/assessment";

const CoursesOverviewTable = ({
  semesterId,
  onSelectCourse,
}: CoursesOverviewTableProps) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
          const completedStatuses = ["Submitted"];
          const completed = assessments.filter((a) =>
            completedStatuses.includes(a.status)
          );
          const now = new Date();
          const upcomingAssessments = assessments
            .filter(
              (a) =>
                !completedStatuses.includes(a.status) &&
                (() => {
                  const [year, month, day] = a.dueDate.split("-").map(Number);
                  const [hours, minutes] = (a.dueTime || "23:59")
                    .split(":")
                    .map(Number);
                  const due = new Date(year, month - 1, day, hours, minutes);
                  return due >= now;
                })()
            )
            .sort((a, b) => {
              const [yearA, monthA, dayA] = a.dueDate.split("-").map(Number);
              const [hoursA, minutesA] = (a.dueTime || "23:59")
                .split(":")
                .map(Number);
              const dueA = new Date(yearA, monthA - 1, dayA, hoursA, minutesA);

              const [yearB, monthB, dayB] = b.dueDate.split("-").map(Number);
              const [hoursB, minutesB] = (b.dueTime || "23:59")
                .split(":")
                .map(Number);
              const dueB = new Date(yearB, monthB - 1, dayB, hoursB, minutesB);

              return dueA.getTime() - dueB.getTime();
            });
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

  const sortedCourses = [...courses].sort((a, b) => {
    if (!a.nextDueDate && !b.nextDueDate) return 0;
    if (!a.nextDueDate) return 1;
    if (!b.nextDueDate) return -1;
    const dateA = new Date(a.nextDueDate);
    const dateB = new Date(b.nextDueDate);
    return dateA.getTime() - dateB.getTime();
  });

  const formatDate = (dateStr: string | null) => {
    return formatLocalDate(dateStr);
  };

  const isUpcoming = (dateStr: string | null) => {
    if (!dateStr) return false;
    return isDateUpcoming(dateStr);
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
      if (!file) {
        throw new Error("No file selected");
      }

      // Validate file type
      if (file.type !== "application/pdf") {
        throw new Error("Please upload a PDF file");
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        throw new Error("File size must be less than 10MB");
      }

      // Create a safe filename with timestamp to prevent collisions
      const timestamp = new Date().getTime();
      const safeFilename = `${timestamp}_${file.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      )}`;
      const filePath = `${user.uid}/${semesterId}/${safeFilename}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("outlines")
        .upload(filePath, file, {
          contentType: "application/pdf",
          upsert: true,
          cacheControl: "3600",
        });

      if (uploadError) throw uploadError;
      if (!uploadData) throw new Error("Upload failed - no data received");

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("outlines").getPublicUrl(filePath);

      // Update the course document
      const courseRef = doc(db, "users", user.uid, "courses", courseName);
      await setDoc(courseRef, {
        courseName,
        semesterId,
        outlineUrl: publicUrl,
        updatedAt: new Date(),
        fileName: safeFilename,
        fileSize: file.size,
        uploadDate: new Date(),
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
        batch.update(doc.ref, {
          outlineUrl: publicUrl,
          outlineUpdatedAt: new Date(),
        });
      });
      await batch.commit();

      // Update local state
      setOutlineUrls((prev) => ({
        ...prev,
        [courseName]: publicUrl,
      }));

      setCourses((prev) =>
        prev.map((course) =>
          course.courseName === courseName
            ? { ...course, outlineUrl: publicUrl }
            : course
        )
      );
    } catch (err) {
      console.error("Error uploading outline:", err);
      setError(err instanceof Error ? err.message : "Failed to upload outline");
    } finally {
      setUploadingCourse(null);
      if (e.target) e.target.value = "";
    }
  };

  const handleViewOutline = (courseName: string) => {
    setSelectedOutline(courseName);
  };

  if (error) return <div className="text-red-600">{error}</div>;
  if (courses.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-medium text-gray-900 dark:text-dark-text-primary mb-6">
          Your Courses
        </h2>
        <div className="text-center py-10 text-gray-500 dark:text-dark-text-tertiary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-dark-text-tertiary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <p className="text-lg font-medium mb-2 dark:text-dark-text-primary">
            No courses yet
          </p>
          <p className="dark:text-dark-text-secondary">
            Add your first assessment to get started with course tracking.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-medium text-gray-900 dark:text-dark-text-primary mb-6">
        Your Courses
      </h2>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-500 dark:border-t-primary-400"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400 animate-fade-in">
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Headers */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-100/50 dark:bg-dark-bg-tertiary/50 rounded-lg">
            <div className="col-span-12 lg:col-span-2 flex items-center">
              <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                Course
              </span>
            </div>
            <div className="col-span-12 lg:col-span-1 flex items-center">
              <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                Total
              </span>
            </div>
            <div className="col-span-12 lg:col-span-1 flex items-center">
              <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                Pending
              </span>
            </div>
            <div className="col-span-12 lg:col-span-3 flex items-center">
              <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                Progress
              </span>
            </div>
            <div className="col-span-12 lg:col-span-4 flex items-center">
              <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                Next Due
              </span>
            </div>
            <div className="col-span-12 lg:col-span-1 flex items-center justify-end">
              <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                Actions
              </span>
            </div>
          </div>

          {/* Course Cards */}
          <div className="space-y-2">
            {sortedCourses.map((course) => (
              <div
                key={course.courseName}
                className="bg-gray-50/50 dark:bg-dark-bg-tertiary/30 rounded-lg transition-all duration-300 p-3"
              >
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-12 lg:col-span-2">
                    <h3 className="font-medium text-gray-900 dark:text-dark-text-primary text-md">
                      {course.courseName}
                    </h3>
                  </div>
                  <div className="col-span-12 lg:col-span-1">
                    <span className="text-gray-700 dark:text-dark-text-secondary text-md">
                      {course.totalAssessments}
                    </span>
                  </div>
                  <div className="col-span-12 lg:col-span-1">
                    {course.pendingAssessments > 0 ? (
                      <span
                        className={`font-medium ${
                          course.pendingAssessments > 2
                            ? "text-amber-600 dark:text-amber-400"
                            : "dark:text-dark-text-primary"
                        }`}
                      >
                        {course.pendingAssessments}
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        All done!
                      </span>
                    )}
                  </div>
                  <div className="col-span-12 lg:col-span-3">
                    <div className="max-w-[200px] bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full bg-primary-500 dark:bg-primary-400"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-1 inline-block">
                      {course.progress}% complete
                    </span>
                  </div>
                  <div className="col-span-12 lg:col-span-4">
                    {course.nextDueDate ? (
                      <div>
                        <div
                          className={`font-medium whitespace-nowrap ${
                            isUpcoming(course.nextDueDate)
                              ? "text-amber-600 dark:text-amber-400"
                              : "dark:text-dark-text-primary"
                          }`}
                        >
                          {formatDate(course.nextDueDate)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-dark-text-tertiary truncate max-w-[200px]">
                          {course.nextAssignment}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-dark-text-tertiary">
                        -
                      </span>
                    )}
                  </div>
                  <div className="col-span-12 lg:col-span-1 flex items-center justify-end space-x-2">
                    {course.outlineUrl ? (
                      <button
                        onClick={() => handleViewOutline(course.courseName)}
                        className="text-gray-500 dark:text-dark-text-tertiary hover:text-gray-700 dark:hover:text-dark-text-secondary p-1 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-md transition-colors"
                        title="View Course Outline"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                          <path
                            d="M6 8h8M6 12h8M6 16h4"
                            stroke="currentColor"
                            strokeWidth="1"
                            fill="none"
                          />
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
                        <div className="text-gray-500 dark:text-dark-text-tertiary hover:text-gray-700 dark:hover:text-dark-text-secondary p-1 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-md transition-colors">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-4 w-4 ${
                              uploadingCourse === course.courseName
                                ? "animate-spin"
                                : ""
                            }`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </label>
                    )}
                    <button
                      onClick={() => onSelectCourse(course.courseName)}
                      className="text-gray-500 dark:text-dark-text-tertiary hover:text-gray-700 dark:hover:text-dark-text-secondary p-1 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-md transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
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
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outline Viewer Modal */}
      {selectedOutline && outlineUrls[selectedOutline] && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[9999] animate-fade-in">
          <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex-none p-6 border-b border-gray-200 dark:border-dark-border-primary">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-dark-text-primary">
                    {selectedOutline} Course Outline
                  </h3>
                  <p className="text-md text-gray-500 dark:text-dark-text-tertiary">
                    View and navigate through the course outline
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      window.open(outlineUrls[selectedOutline], "_blank")
                    }
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-dark-border-primary shadow-sm text-md font-medium rounded-md text-gray-700 dark:text-dark-text-primary bg-white dark:bg-dark-bg-tertiary hover:bg-gray-50 dark:hover:bg-dark-bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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
                  <label className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-dark-border-primary shadow-sm text-md font-medium rounded-md text-gray-700 dark:text-dark-text-primary bg-white dark:bg-dark-bg-tertiary hover:bg-gray-50 dark:hover:bg-dark-bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer">
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
                    {uploadingCourse === selectedOutline
                      ? "Uploading..."
                      : "Reupload"}
                  </label>
                  <button
                    onClick={() => setSelectedOutline(null)}
                    className="inline-flex items-center p-1.5 border border-transparent rounded-md text-gray-400 dark:text-dark-text-tertiary hover:text-gray-500 dark:hover:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="p-6">
                <div className="w-full h-full bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg overflow-hidden">
                  <iframe
                    src={outlineUrls[selectedOutline]}
                    className="w-full h-full"
                    title={`${selectedOutline} Course Outline`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesOverviewTable;
