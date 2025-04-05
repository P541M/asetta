import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";

interface Assessment {
  id: string;
  courseName: string;
  assignmentName: string;
  dueDate: string;
  dueTime: string; // Added dueTime
  weight: number;
  status: string;
}

interface CalendarDay {
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
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

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
      const totalDays =
        daysFromPrevMonth + lastDayOfMonth.getDate() + daysFromNextMonth;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const days: CalendarDay[] = [];
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
    setSelectedDay(today);
  };

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDay(day.date);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Submitted":
        return "bg-emerald-100 border-emerald-200 text-emerald-800";
      case "In progress":
        return "bg-blue-100 border-blue-200 text-blue-800";
      case "Draft":
        return "bg-purple-100 border-purple-200 text-purple-800";
      case "Pending Submission":
        return "bg-orange-100 border-orange-200 text-orange-800";
      case "Under Review":
        return "bg-indigo-100 border-indigo-200 text-indigo-800";
      case "Needs Revision":
        return "bg-amber-100 border-amber-200 text-amber-800";
      case "Missed/Late":
        return "bg-red-100 border-red-200 text-red-800";
      case "On Hold":
        return "bg-yellow-100 border-yellow-200 text-yellow-800";
      case "Deferred":
        return "bg-gray-200 border-gray-300 text-gray-700";
      default:
        return "bg-gray-100 border-gray-200 text-gray-800";
    }
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

  const countAssessments = (date: Date): number => {
    const dateStr = formatDateForComparison(date);
    return assessments.filter((assessment) => assessment.dueDate === dateStr)
      .length;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-gray-900 mb-2 md:mb-0">
          Calendar View
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={previousMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Previous Month"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
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
          <h3 className="text-lg font-medium text-gray-800">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Next Month"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
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
            className="ml-4 px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
          >
            Today
          </button>
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {dayNames.map((day, index) => (
            <div
              key={index}
              className="p-2 text-center text-sm font-medium text-gray-700"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-fr bg-white">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              onClick={() => handleDayClick(day)}
              className={`min-h-[100px] p-2 border-r border-b relative ${
                day.isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"
              } ${day.isToday ? "bg-indigo-50" : ""} ${
                selectedDay && day.date.getTime() === selectedDay.getTime()
                  ? "ring-2 ring-indigo-400 z-10"
                  : ""
              } transition-all duration-150 hover:bg-gray-50 cursor-pointer`}
            >
              <div className="flex justify-between items-start">
                <span
                  className={`inline-block h-6 w-6 rounded-full text-center leading-6 text-sm ${
                    day.isToday ? "bg-indigo-500 text-white" : ""
                  }`}
                >
                  {day.date.getDate()}
                </span>
                {day.assessments.length > 0 && (
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    {day.assessments.length}
                  </span>
                )}
              </div>
              <div className="mt-1 space-y-1 text-xs">
                {day.assessments.slice(0, 2).map((assessment, idx) => (
                  <div
                    key={idx}
                    className={`p-1 rounded truncate border ${getStatusColor(
                      assessment.status
                    )}`}
                    title={`${assessment.courseName}: ${assessment.assignmentName} - Due ${assessment.dueTime}`}
                  >
                    {assessment.courseName}: {assessment.assignmentName}
                  </div>
                ))}
                {day.assessments.length > 2 && (
                  <div className="text-xs text-gray-500 font-medium pl-1">
                    + {day.assessments.length - 2} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedDay && (
        <div className="mt-6 border rounded-lg p-4 bg-white shadow-sm animate-fade-in">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {selectedDay.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </h3>
          {countAssessments(selectedDay) === 0 ? (
            <p className="text-gray-500">No assessments due on this day</p>
          ) : (
            <div className="space-y-3">
              {assessments
                .filter(
                  (assessment) =>
                    assessment.dueDate === formatDateForComparison(selectedDay)
                )
                .map((assessment, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${getDueDateStatus(
                      selectedDay,
                      assessment.dueTime
                    )}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {assessment.assignmentName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {assessment.courseName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Due:{" "}
                          {formatDateTime(
                            new Date(assessment.dueDate),
                            assessment.dueTime
                          )}
                        </p>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-md text-sm font-medium ${getStatusColor(
                          assessment.status
                        )}`}
                      >
                        {assessment.status}
                      </div>
                    </div>
                    {assessment.weight > 0 && (
                      <p className="text-sm mt-1 font-medium">
                        Weight: {assessment.weight}%
                      </p>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
