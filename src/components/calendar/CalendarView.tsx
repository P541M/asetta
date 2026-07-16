import { useState, useEffect, useRef, KeyboardEvent, useCallback } from "react";
import { Check, ChevronLeft, ChevronRight, ChevronsUpDown, Download } from "lucide-react";
import { useAssessments } from "../../hooks/useAssessments";
import { generateICSFile } from "../../utils/icsGenerator";
import { Assessment } from "../../types/assessment";
import { Day, CalendarViewProps } from "../../types/calendar";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import PanelHeader from "../ui/PanelHeader";
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

const statusFilterOptions: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "Not started", label: "Not started" },
  { value: "In progress", label: "In progress" },
  { value: "Submitted", label: "Submitted" },
  { value: "Missed", label: "Missed" },
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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Day[]>([]);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const calendarRef = useRef<HTMLDivElement>(null);

  const { assessments, refetch } = useAssessments(semesterId);

  // The hook fetches on mount and on semester change; this covers external
  // refreshes (e.g. a new assessment added from another tab).
  const lastTriggerRef = useRef(refreshTrigger);
  useEffect(() => {
    if (refreshTrigger !== lastTriggerRef.current) {
      lastTriggerRef.current = refreshTrigger;
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

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

  // Export calendar (the button is disabled when there is nothing to export)
  const handleExportCalendar = () => {
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

  const activeFilter =
    statusFilterOptions.find((option) => option.value === statusFilter) ?? statusFilterOptions[0];

  return (
    <div className="p-6">
      <PanelHeader
        title="Calendar"
        actions={
          <>
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search assessments"
              aria-label="Search assessments"
              className="h-10 w-full sm:w-48"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  className="min-w-40 justify-between"
                  aria-label="Filter by status"
                >
                  <span className="min-w-0 truncate">{activeFilter.label}</span>
                  <ChevronsUpDown className="text-muted-foreground" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                {statusFilterOptions.map(({ value, label }) => (
                  <DropdownMenuItem key={value} onSelect={() => setStatusFilter(value)}>
                    <Check
                      className={cn(statusFilter === value ? "opacity-100" : "opacity-0")}
                      aria-hidden
                    />
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={previousMonth}
                aria-label="Previous month"
              >
                <ChevronLeft aria-hidden />
              </Button>
              <span className="min-w-32 text-center text-sm font-medium text-foreground">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={nextMonth}
                aria-label="Next month"
              >
                <ChevronRight aria-hidden />
              </Button>
            </div>

            <Button type="button" variant="secondary" onClick={goToToday}>
              Today
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={handleExportCalendar}
              disabled={assessments.length === 0}
            >
              <Download aria-hidden />
              Export
            </Button>
          </>
        }
      />

      <div
        ref={calendarRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Calendar. Use the arrow keys to change month"
        className="rounded-xl outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
