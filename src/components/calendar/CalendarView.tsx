import { useState, useEffect, useRef, KeyboardEvent, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, updateDoc, doc } from "firebase/firestore";
import { generateICSFile } from "../../utils/icsGenerator";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { Assessment } from "../../types/assessment";
import { Day, CalendarViewProps } from "../../types/calendar";
import { SkeletonLoader } from "../ui";

const CalendarView = ({ selectedSemester, semesterId }: CalendarViewProps) => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Day[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const calendarRef = useRef<HTMLDivElement>(null);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Fetch assessments
  useEffect(() => {
    const fetchAssessments = async () => {
      if (!user || !semesterId) {
        setAssessments([]);
        return;
      }
      setIsLoading(true);
      try {
        const assessmentsRef = collection(
          db,
          "users",
          user.uid,
          "semesters",
          semesterId,
          "assessments"
        );
        const q = query(assessmentsRef);
        const querySnapshot = await getDocs(q);
        const assessmentsList: Assessment[] = [];
        querySnapshot.forEach((doc) => {
          assessmentsList.push({
            id: doc.id,
            ...(doc.data() as Omit<Assessment, "id">),
          });
        });
        setAssessments(assessmentsList);
      } catch (error) {
        console.error("Error fetching assessments for calendar:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssessments();
  }, [user, semesterId]);

  // Filter assessments based on search and status
  const getAssessmentsForDate = useCallback(
    (date: Date): Assessment[] => {
      const dateStr = formatDateForComparison(date);
      return assessments.filter((assessment) => {
        const matchesDate = assessment.dueDate === dateStr;
        const matchesSearch =
          searchTerm === "" ||
          assessment.assignmentName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          assessment.courseName
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || assessment.status === statusFilter;
        return matchesDate && matchesSearch && matchesStatus;
      });
    },
    [assessments, searchTerm, statusFilter]
  );

  // Generate calendar days
  useEffect(() => {
    const generateCalendarDays = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      const daysFromPrevMonth = firstDayOfMonth.getDay();
      const daysFromNextMonth = 6 - lastDayOfMonth.getDay();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const days: Day[] = [];

      // Previous month days
      const prevMonth = new Date(year, month, 0);
      const prevMonthDays = prevMonth.getDate();
      for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
        const date = new Date(year, month - 1, prevMonthDays - i);
        days.push({
          date,
          isCurrentMonth: false,
          isToday: date.getTime() === today.getTime(),
          assessments: getAssessmentsForDate(date),
        });
      }

      // Current month days
      for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const date = new Date(year, month, i);
        days.push({
          date,
          isCurrentMonth: true,
          isToday: date.getTime() === today.getTime(),
          assessments: getAssessmentsForDate(date),
        });
      }

      // Next month days
      for (let i = 1; i <= daysFromNextMonth; i++) {
        const date = new Date(year, month + 1, i);
        days.push({
          date,
          isCurrentMonth: false,
          isToday: date.getTime() === today.getTime(),
          assessments: getAssessmentsForDate(date),
        });
      }

      setCalendarDays(days);
    };

    generateCalendarDays();
  }, [currentMonth, getAssessmentsForDate]);

  // Date formatting helpers
  const formatDateForComparison = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateTime = (date: Date, time: string): string => {
    const [hours, minutes] = time.split(":").map((num) => parseInt(num, 10));
    date.setHours(hours, minutes);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Navigation handlers
  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
    setSelectedDay(null);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    const todayDay = calendarDays.find(
      (day) => day.date.getTime() === today.getTime()
    );
    if (todayDay) {
      setSelectedDay(todayDay);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!calendarRef.current) return;

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        previousMonth();
        break;
      case "ArrowRight":
        e.preventDefault();
        nextMonth();
        break;
      case "Home":
        e.preventDefault();
        goToToday();
        break;
    }
  };

  // Drag and drop handlers
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !user) return;

    const assessmentId = active.id as string;
    const newDate = over.id as string;

    try {
      const assessmentRef = doc(
        db,
        "users",
        user.uid,
        "semesters",
        semesterId,
        "assessments",
        assessmentId
      );
      await updateDoc(assessmentRef, { dueDate: newDate });
    } catch (error) {
      console.error("Error updating assessment date:", error);
    }
  };

  // Status color mapping
  const getStatusColor = (status: string): string => {
    if (status === "Submitted") {
      return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800";
    }
    if (status === "In progress") {
      return "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800";
    }
    return "bg-gray-50 dark:bg-dark-bg-tertiary text-gray-800 dark:text-gray-400 border border-gray-200 dark:border-dark-border-primary";
  };

  // Export calendar
  const handleExportCalendar = () => {
    if (assessments.length === 0) {
      alert("No assessments to export.");
      return;
    }

    const icsContent = generateICSFile(assessments, selectedSemester);
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedSemester}_assessments.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="p-6">
        <SkeletonLoader type="calendar" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-medium text-gray-900 dark:text-dark-text-primary">
            Calendar View
          </h2>
          <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Search and filter */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search assessments..."
              className="input py-1.5 px-3 text-sm w-48"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input py-1.5 px-3 text-sm"
            >
              <option value="all">All Status</option>
              <option value="Not started">Not Started</option>
              <option value="In progress">In Progress</option>
              <option value="Submitted">Submitted</option>
            </select>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={previousMonth}
              className="p-2 rounded-full hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary transition-colors"
              title="Previous Month"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-light-text-tertiary dark:text-dark-text-tertiary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm bg-light-button-primary/10 dark:bg-dark-button-primary/10 text-light-button-primary dark:text-dark-button-primary rounded-md hover:bg-light-button-primary/20 dark:hover:bg-dark-button-primary/20 transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-full hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary transition-colors"
              title="Next Month"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-light-text-tertiary dark:text-dark-text-tertiary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            <button
              onClick={handleExportCalendar}
              className="btn-primary ml-2 px-3 py-1.5 text-sm flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Export
            </button>
          </div>
        </div>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div
          ref={calendarRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="focus:outline-none"
        >
          <div className="grid grid-cols-7 border-b dark:border-dark-border-primary bg-gray-50 dark:bg-dark-bg-tertiary">
            {dayNames.map((day, index) => (
              <div
                key={index}
                className="p-2 text-center text-sm font-medium text-gray-700 dark:text-dark-text-primary"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-fr bg-white dark:bg-dark-bg-secondary border-l border-t dark:border-dark-border-primary">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                onClick={() =>
                  day.assessments.length > 0 && setSelectedDay(day)
                }
                className={`relative p-2 min-h-[120px] border-r border-b dark:border-dark-border-primary transition-colors ${
                  day.isCurrentMonth
                    ? "bg-white dark:bg-dark-bg-secondary"
                    : "bg-gray-50/50 dark:bg-dark-bg-tertiary/50"
                } ${
                  day.isToday
                    ? "ring-2 ring-light-button-primary dark:ring-dark-button-primary ring-inset"
                    : ""
                } ${
                  day.assessments.length > 0
                    ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-medium ${
                      day.isCurrentMonth
                        ? "text-gray-900 dark:text-dark-text-primary"
                        : "text-gray-400 dark:text-dark-text-tertiary"
                    } ${
                      day.isToday
                        ? "text-light-button-primary dark:text-dark-button-primary"
                        : ""
                    }`}
                  >
                    {day.date.getDate()}
                  </span>
                  {day.assessments.length > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center text-xs font-medium text-light-button-primary dark:text-dark-button-primary bg-light-button-secondary dark:bg-dark-button-secondary rounded-full">
                      {day.assessments.length}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {day.assessments.slice(0, 3).map((assessment) => (
                    <div
                      key={assessment.id}
                      className={`text-xs px-2 py-1.5 rounded-md truncate ${getStatusColor(
                        assessment.status
                      )} hover:shadow-sm transition-all duration-200`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate font-medium">
                          {assessment.assignmentName}
                        </span>
                        <span className="ml-2 text-[10px] font-medium opacity-75">
                          {new Date(
                            `2000-01-01T${assessment.dueTime}`
                          ).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {day.assessments.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-dark-text-tertiary font-medium bg-gray-50 dark:bg-dark-bg-tertiary px-2 py-1 rounded-md border border-gray-200 dark:border-dark-border-primary">
                      +{day.assessments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DndContext>

      {/* Day detail modal */}
      {selectedDay && (
        <div className="modal-backdrop z-50">
          <div className="modal-container w-full max-w-2xl">
            <div className="modal-header">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-light-text-primary dark:text-dark-text-primary">
                  {selectedDay.date.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h3>
                  <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                    {selectedDay.assessments.length} assessment
                    {selectedDay.assessments.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-secondary dark:hover:text-dark-text-secondary"
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
            </div>
            <div className="modal-content space-y-3 max-h-[60vh] overflow-y-auto">
              {selectedDay.assessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="p-4 rounded-lg border border-light-border-primary dark:border-dark-border-primary bg-light-bg-primary dark:bg-dark-bg-tertiary hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-medium text-light-text-primary dark:text-dark-text-primary">
                        {assessment.assignmentName}
                      </h4>
                      <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary font-medium">
                        {assessment.courseName}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        assessment.status
                      )}`}
                    >
                      {assessment.status}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    <p>
                      Due:{" "}
                      {formatDateTime(selectedDay.date, assessment.dueTime)}
                    </p>
                    {assessment.weight > 0 && (
                      <p>Weight: {assessment.weight}%</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
