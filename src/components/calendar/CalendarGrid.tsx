import { Day } from "../../types/calendar";
import { cn } from "@/lib/utils";
import { statusTintClasses } from "../tables/assessments/StatusSelect";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarGridProps {
  calendarDays: Day[];
  onSelectDay: (day: Day) => void;
}

/** Month grid: weekday header row plus one cell per day with assessment chips. */
const CalendarGrid = ({ calendarDays, onSelectDay }: CalendarGridProps) => (
  <div className="overflow-hidden rounded-xl border border-border">
    <div className="grid grid-cols-7 border-b border-border bg-secondary/50">
      {dayNames.map((day) => (
        <div
          key={day}
          className="p-2 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground"
        >
          {day}
        </div>
      ))}
    </div>
    {/* gap-px over bg-border draws the structural cell hairlines */}
    <div className="grid auto-rows-fr grid-cols-7 gap-px bg-border">
      {calendarDays.map((day, index) => (
        <div
          key={index}
          onClick={() => day.assessments.length > 0 && onSelectDay(day)}
          className={cn(
            "relative min-h-[120px] p-2 transition-colors",
            day.isCurrentMonth ? "bg-card" : "bg-secondary",
            day.assessments.length > 0 && "cursor-pointer hover:bg-accent",
          )}
        >
          <div className="mb-2 flex items-center justify-between">
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-sm font-medium",
                day.isToday
                  ? "bg-primary/10 text-primary"
                  : day.isCurrentMonth
                    ? "text-foreground"
                    : "text-muted-foreground/60",
              )}
            >
              {day.date.getDate()}
            </span>
            {day.assessments.length > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {day.assessments.length}
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            {day.assessments.slice(0, 3).map((assessment) => (
              <div
                key={assessment.id}
                className={cn(
                  "rounded-md px-2 py-1.5 text-xs font-medium",
                  statusTintClasses[assessment.status],
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{assessment.assignmentName}</span>
                  <span className="shrink-0 text-xs opacity-70">
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
              <div className="px-2 text-xs font-medium text-muted-foreground">
                +{day.assessments.length - 3} more
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CalendarGrid;
