import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { generateICSFile } from "../utils/icsGenerator"; // New utility import

interface Assessment {
  id: string;
  courseName: string;
  assignmentName: string;
  dueDate: string;
  dueTime: string;
  weight: number;
  status: string;
}

interface Day {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  assessments: Assessment[];
}

interface CalendarViewProps {
  selectedSemester: string;
  semesterId: string;
}

const CalendarView = ({ selectedSemester, semesterId }: CalendarViewProps) => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Day[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);

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
      for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const date = new Date(year, month, i);
        days.push({
          date,
          isCurrentMonth: true,
          isToday: date.getTime() === today.getTime(),
          assessments: getAssessmentsForDate(date),
        });
      }
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

    const getAssessmentsForDate = (date: Date): Assessment[] => {
      const dateStr = formatDateForComparison(date);
      return assessments.filter((assessment) => assessment.dueDate === dateStr);
    };

    generateCalendarDays();
  }, [currentMonth, assessments]);

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

  const handleDayClick = (day: Day) => {
    setSelectedDay(day);
  };

  const getDueDateStatus = (date: Date, time: string): string => {
    const now = new Date();
    const [hours, minutes] = time.split(":").map((num) => parseInt(num, 10));
    const due = new Date(date);
    due.setHours(hours, minutes);
    const diffDays = Math.ceil(
      (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0) return "border-red-300 bg-red-50";
    if (diffDays <= 3) return "border-amber-300 bg-amber-50";
    if (diffDays <= 7) return "border-yellow-300 bg-yellow-50";
    return "";
  };

  // Function to handle exporting the calendar
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm border border-gray-100 dark:border-dark-border-primary p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-gray-900 dark:text-dark-text-primary mb-2 md:mb-0">
          Calendar View
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={previousMonth}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
            title="Previous Month"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600 dark:text-dark-text-tertiary"
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
          <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text-primary">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
            title="Next Month"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600 dark:text-dark-text-tertiary"
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
            onClick={goToToday}
            className="ml-4 px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
          >
            Today
          </button>
          <button
            onClick={handleExportCalendar}
            className="ml-4 px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
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
            Export to Calendar
          </button>
        </div>
      </div>
      <div className="border dark:border-dark-border-primary rounded-lg overflow-hidden shadow-sm">
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
        <div className="grid grid-cols-7 auto-rows-fr bg-white dark:bg-dark-bg-secondary">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              onClick={() => handleDayClick(day)}
              className={`relative p-2 min-h-[100px] border border-gray-200 dark:border-dark-border ${
                day.isCurrentMonth
                  ? "bg-white dark:bg-dark-bg-secondary"
                  : "bg-gray-50 dark:bg-dark-bg-tertiary"
              } ${
                day.isToday ? "ring-2 ring-indigo-500 dark:ring-indigo-400" : ""
              } ${
                day.assessments.length > 0
                  ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
                  : ""
              }`}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  day.isCurrentMonth
                    ? "text-gray-900 dark:text-dark-text-primary"
                    : "text-gray-400 dark:text-dark-text-tertiary"
                } ${day.isToday ? "text-indigo-600 dark:text-indigo-400" : ""}`}
              >
                {day.date.getDate()}
              </div>
              {day.assessments.length > 0 && (
                <div className="space-y-1">
                  {day.assessments.slice(0, 2).map((assessment) => (
                    <div
                      key={assessment.id}
                      className={`text-xs px-1.5 py-0.5 rounded truncate ${
                        assessment.status === "Submitted"
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400"
                          : assessment.status === "In progress"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
                          : assessment.status === "Draft"
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400"
                          : assessment.status === "Pending Submission"
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400"
                          : assessment.status === "Under Review"
                          ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400"
                          : assessment.status === "Needs Revision"
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400"
                          : assessment.status === "Missed/Late"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                          : assessment.status === "On Hold"
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                          : getDueDateStatus(day.date, assessment.dueTime) ===
                            "overdue"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                          : getDueDateStatus(day.date, assessment.dueTime) ===
                            "urgent"
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400"
                          : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {assessment.assignmentName}
                    </div>
                  ))}
                  {day.assessments.length > 2 && (
                    <div className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                      +{day.assessments.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {selectedDay && selectedDay.assessments.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg p-6 w-full max-w-2xl animate-scale">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
                Assessments for {selectedDay.date.toLocaleDateString()}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-gray-400 dark:text-dark-text-tertiary hover:text-gray-500 dark:hover:text-dark-text-secondary"
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
            <div className="space-y-4">
              {selectedDay.assessments.map((assessment: Assessment) => (
                <div
                  key={assessment.id}
                  className="p-4 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg-tertiary"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-medium text-gray-900 dark:text-dark-text-primary">
                        {assessment.assignmentName}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                        {assessment.courseName}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        assessment.status === "Submitted"
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400"
                          : assessment.status === "In progress"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
                          : assessment.status === "Draft"
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400"
                          : assessment.status === "Pending Submission"
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400"
                          : assessment.status === "Under Review"
                          ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400"
                          : assessment.status === "Needs Revision"
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400"
                          : assessment.status === "Missed/Late"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                          : assessment.status === "On Hold"
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                          : getDueDateStatus(
                              selectedDay.date,
                              assessment.dueTime
                            ) === "overdue"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                          : getDueDateStatus(
                              selectedDay.date,
                              assessment.dueTime
                            ) === "urgent"
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400"
                          : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {assessment.status}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-dark-text-secondary">
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
