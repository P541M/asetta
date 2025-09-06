import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  formatLocalDate,
  isUpcoming as isDateUpcoming,
} from "../../utils/dateUtils";
import { CoursesOverviewTableProps } from "../../types/course";
import { useCourseRename } from "../../hooks/useCourseRename";

const CoursesOverviewTable = ({
  courses,
  onSelectCourse,
  semesterId,
  onCourseRenamed,
}: CoursesOverviewTableProps) => {
  const router = useRouter();
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const { renameCourse, isRenaming } = useCourseRename(semesterId, {
    onSuccess: (oldName, newName) => {
      setEditingCourse(null);
      onCourseRenamed?.();
      
      // Update navigation if user is currently viewing the renamed course
      if (router.query.course === oldName) {
        const newQuery = { ...router.query };
        newQuery.course = newName;
        router.replace({ pathname: router.pathname, query: newQuery }, undefined, {
          shallow: true,
        });
      }
    },
    onError: (error) => {
      console.error('Course rename failed:', error);
      setEditingCourse(null);
    }
  });

  const handleEditStart = (courseName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering course selection
    setEditingCourse(courseName);
    setEditValue(courseName);
  };

  const handleEditSubmit = async (oldName: string) => {
    const newName = editValue.trim();
    if (newName === oldName.trim() || !newName) {
      setEditingCourse(null);
      return;
    }
    
    await renameCourse(oldName, newName);
  };

  const handleKeyDown = (e: React.KeyboardEvent, courseName: string) => {
    if (e.key === 'Enter') {
      handleEditSubmit(courseName);
    } else if (e.key === 'Escape') {
      setEditingCourse(null);
    }
  };
  if (courses.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-medium text-light-text-primary dark:text-dark-text-primary mb-6">
          Courses
        </h2>
        <div className="text-center py-10">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h3 className="text-lg font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
            No courses yet
          </h3>
          <p className="text-light-text-tertiary dark:text-dark-text-tertiary">
            Add some assessments to see your courses here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-medium text-light-text-primary dark:text-dark-text-primary mb-6">
        Courses
      </h2>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => {
          const progressColor =
            course.progress >= 80
              ? "bg-emerald-500"
              : course.progress >= 50
              ? "bg-amber-500"
              : "bg-red-500";

          const isUpcoming = course.nextDueDate
            ? isDateUpcoming(course.nextDueDate)
            : false;

          return (
            <div
              key={course.courseName}
              onClick={() => onSelectCourse(course.courseName)}
              className="bg-light-bg-primary dark:bg-dark-bg-tertiary rounded-lg p-6 border border-light-border-primary dark:border-dark-border-primary hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 mr-3">
                  {editingCourse === course.courseName ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handleEditSubmit(course.courseName)}
                      onKeyDown={(e) => handleKeyDown(e, course.courseName)}
                      onClick={(e) => e.stopPropagation()}
                      className="text-lg font-medium bg-transparent border-b-2 border-light-button-primary dark:border-dark-button-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none w-full"
                      autoFocus
                      disabled={isRenaming}
                    />
                  ) : (
                    <div className="flex items-center group">
                      <h3 className="text-lg font-medium text-light-text-primary dark:text-dark-text-primary line-clamp-2 flex-1">
                        {isRenaming && editingCourse === course.courseName ? 'Updating...' : course.courseName}
                      </h3>
                      <button
                        onClick={(e) => handleEditStart(course.courseName, e)}
                        className="ml-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary transition-all duration-200"
                        title="Edit course name"
                        disabled={isRenaming}
                      >
                        <svg className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-2xl font-bold text-light-button-primary dark:text-dark-button-primary">
                    {course.progress}%
                  </div>
                  <div className="w-12 bg-gray-200 dark:bg-dark-bg-primary rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                    Total
                  </p>
                  <p className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
                    {course.totalAssessments}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                    Pending
                  </p>
                  <p className="text-xl font-semibold text-amber-600 dark:text-amber-400">
                    {course.pendingAssessments}
                  </p>
                </div>
              </div>

              {course.nextDueDate && course.nextAssignment && (
                <div className="border-t border-light-border-primary dark:border-dark-border-primary pt-4">
                  <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mb-1">
                    Next Due
                  </p>
                  <p className="font-medium text-light-text-primary dark:text-dark-text-primary text-sm line-clamp-2 mb-1">
                    {course.nextAssignment}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      isUpcoming
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-light-text-secondary dark:text-dark-text-secondary"
                    }`}
                  >
                    {formatLocalDate(course.nextDueDate)}
                    {isUpcoming && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                        Upcoming
                      </span>
                    )}
                  </p>
                </div>
              )}

              {!course.nextDueDate && (
                <div className="border-t border-light-border-primary dark:border-dark-border-primary pt-4">
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    All assessments completed! 🎉
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default CoursesOverviewTable;
