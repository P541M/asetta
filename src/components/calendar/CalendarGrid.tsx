import { Day } from "../../types/calendar";
import { getStatusBackgroundClasses } from "../../utils/statusUtils";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarGridProps {
  calendarDays: Day[];
  onSelectDay: (day: Day) => void;
}

/** Month grid: weekday header row plus one cell per day with assessment chips. */
const CalendarGrid = ({ calendarDays, onSelectDay }: CalendarGridProps) => (
  <>
    <div className="grid grid-cols-7 border-b dark:border-dark-border-primary bg-gray-50 dark:bg-dark-bg-tertiary rounded-t-xl">
      {dayNames.map((day, index) => (
        <div
          key={index}
          className="p-2 text-center text-sm font-medium text-gray-700 dark:text-dark-text-primary"
        >
          {day}
        </div>
      ))}
    </div>
    <div className="grid grid-cols-7 auto-rows-fr bg-white dark:bg-dark-bg-secondary border-l border-t dark:border-dark-border-primary rounded-b-xl overflow-hidden">
      {calendarDays.map((day, index) => (
        <div
          key={index}
          onClick={() => day.assessments.length > 0 && onSelectDay(day)}
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
              } ${day.isToday ? "text-light-button-primary dark:text-dark-button-primary" : ""}`}
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
                className={`text-xs px-2 py-1.5 rounded-md truncate ${getStatusBackgroundClasses(
                  assessment.status,
                )} hover:shadow-sm transition-all duration-200`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate font-medium">{assessment.assignmentName}</span>
                  <span className="ml-2 text-[10px] font-medium opacity-75">
                    {new Date(`2000-01-01T${assessment.dueTime}`).toLocaleTimeString("en-US", {
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
  </>
);

export default CalendarGrid;
