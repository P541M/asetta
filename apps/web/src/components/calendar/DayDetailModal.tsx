import { useEffect } from "react";
import { X } from "lucide-react";
import { Day } from "../../types/calendar";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { statusTintClasses } from "../tables/assessments/StatusSelect";

interface DayDetailModalProps {
  day: Day;
  onClose: () => void;
  formatDateTime: (date: Date, time: string) => string;
}

/** Modal listing all assessments due on the clicked day (standard overlay recipe). */
const DayDetailModal = ({ day, onClose, formatDateTime }: DayDetailModalProps) => {
  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const dateLabel = day.date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-150 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-card shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-label={dateLabel}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-5 pb-1 pt-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">{dateLabel}</h3>
            <p className="text-xs font-medium text-muted-foreground">
              {day.assessments.length} assessment{day.assessments.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground"
            onClick={onClose}
            aria-label="Close"
          >
            <X aria-hidden />
          </Button>
        </div>
        <div className="px-5 pb-5 pt-3">
          <div className="max-h-[60vh] space-y-1.5 overflow-y-auto rounded-xl bg-secondary/50 p-1.5">
            {day.assessments.map((assessment) => (
              <div key={assessment.id} className="rounded-lg bg-card p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {assessment.assignmentName}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {assessment.courseName}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center rounded-lg px-2 py-0.5 text-xs font-medium",
                      statusTintClasses[assessment.status],
                    )}
                  >
                    {assessment.status}
                  </span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Due: {formatDateTime(day.date, assessment.dueTime)}</p>
                  {assessment.weight > 0 && <p>Weight: {assessment.weight}%</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayDetailModal;
