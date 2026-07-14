import { useState, useEffect, useRef, KeyboardEvent, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { generateICSFile } from "../../utils/icsGenerator";
import { Assessment } from "../../types/assessment";
import { Day, CalendarViewProps } from "../../types/calendar";
import CustomSelect from "../ui/CustomSelect";
import { statusFilterOptions } from "./statusFilterOptions";
import CalendarGrid from "./CalendarGrid";
import DayDetailModal from "./DayDetailModal";

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

const CalendarView = ({ selectedSemester, semesterId, refreshTrigger }: CalendarViewProps) => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Day[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const calendarRef = useRef<HTMLDivElement>(null);

  // Fetch assessments
  useEffect(() => {
    const fetchAssessments = async () => {
      if (!user || !semesterId) {
        setAssessments([]);
        return;
      }
      try {
        const assessmentsRef = collection(
          db,
          "users",
          user.uid,
          "semesters",
          semesterId,
          "assessments",
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
      }
    };
    fetchAssessments();
  }, [user, semesterId, refreshTrigger]);

  // Filter assessments based on search and status
  const getAssessmentsForDate = useCallback(
    (date: Date): Assessment[] => {
      const dateStr = formatDateForComparison(date);
      return assessments.filter((assessment) => {
        const matchesDate = assessment.dueDate === dateStr;
        const matchesSearch =
          searchTerm === "" ||
          assessment.assignmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assessment.courseName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || assessment.status === statusFilter;
        return matchesDate && matchesSearch && matchesStatus;
      });
    },
    [assessments, searchTerm, statusFilter],
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

  // Navigation handlers
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    const todayDay = calendarDays.find((day) => day.date.getTime() === today.getTime());
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

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-medium text-light-text-primary dark:text-dark-text-primary">
            Calendar
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
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusFilterOptions}
              placeholder="Filter by status"
              className="min-w-[140px]"
              size="sm"
            />
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

      <div
        ref={calendarRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="focus:outline-hidden"
      >
        <CalendarGrid calendarDays={calendarDays} onSelectDay={setSelectedDay} />
      </div>

      {/* Day detail modal */}
      {selectedDay && (
        <DayDetailModal
          day={selectedDay}
          onClose={() => setSelectedDay(null)}
          formatDateTime={formatDateTime}
        />
      )}
    </div>
  );
};

export default CalendarView;
