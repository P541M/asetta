import { ChartColumn, CircleAlert, CircleCheck, CircleDashed, type LucideIcon } from "lucide-react";
import { Assessment } from "../../../types/assessment";
import { cn } from "@/lib/utils";
import { formatLocalDate } from "../../../utils/dateUtils";
import EmptyState from "../../ui/EmptyState";
import { statusTintClasses } from "../../tables/assessments/StatusSelect";
import NumberField from "./NumberField";

interface AssessmentBreakdownProps {
  assessments: Assessment[];
  onWeightChange: (assessmentId: string, value: string) => void;
  onMarkChange: (assessmentId: string, value: string) => void;
}

/* One grid template, two consumers (header + rows) — the tableGrid.ts rule
   applied to the breakdown. Columns: assessment · status · weight · mark · points. */
const gradeGridClass =
  "hidden lg:grid lg:grid-cols-[minmax(0,1fr)_5rem_7rem_7rem_5rem] lg:items-center lg:gap-4";

/** Status marker (icon + tint) for a row; overdue is derived, not stored. */
const getAssessmentStatus = (
  assessment: Assessment,
): { icon: LucideIcon; tintClass: string; label: string } => {
  const now = new Date();
  const dueDate = new Date(`${assessment.dueDate}T${assessment.dueTime}`);

  if (assessment.status === "Submitted") {
    return { icon: CircleCheck, tintClass: statusTintClasses.Submitted, label: "Submitted" };
  }
  if (dueDate < now) {
    return { icon: CircleAlert, tintClass: statusTintClasses.Missed, label: "Overdue" };
  }
  return { icon: CircleDashed, tintClass: statusTintClasses["Not started"], label: "Pending" };
};

/** Editable weight/mark list for all assessments in the selected course. */
const AssessmentBreakdown = ({
  assessments,
  onWeightChange,
  onMarkChange,
}: AssessmentBreakdownProps) => (
  <div>
    {/* Item-title tier, no subtitle — the same "no header subtitles" call as
        PanelHeader (editability is evident from the inputs themselves) */}
    <h3 className="mb-3 text-base font-semibold text-foreground">Assessment breakdown</h3>

    {assessments.length === 0 ? (
      <EmptyState
        icon={ChartColumn}
        title="No assessments yet"
        description="This course doesn't have any assessments yet."
      />
    ) : (
      <div className="space-y-2">
        {/* Desktop headers - hidden on mobile */}
        <div className={cn(gradeGridClass, "px-4 pb-1")}>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Assessment
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Status
          </span>
          <span className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Weight
          </span>
          <span className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Mark
          </span>
          <span className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Points
          </span>
        </div>

        <div className="space-y-2">
          {assessments.map((assessment) => {
            const status = getAssessmentStatus(assessment);
            const StatusIcon = status.icon;
            const contribution =
              assessment.mark && assessment.weight
                ? ((assessment.mark * assessment.weight) / 100).toFixed(1)
                : "0.0";

            return (
              <div
                key={assessment.id}
                className="rounded-xl bg-secondary/50 p-4 transition-colors hover:bg-accent/50 lg:py-3"
              >
                {/* Mobile layout */}
                <div className="space-y-4 lg:hidden">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-semibold leading-tight text-foreground">
                        {assessment.assignmentName}
                      </h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Due {formatLocalDate(assessment.dueDate)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full",
                        status.tintClass,
                      )}
                      title={status.label}
                    >
                      <StatusIcon className="size-4" aria-hidden />
                      <span className="sr-only">{status.label}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor={`weight-${assessment.id}`}
                        className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        Weight
                      </label>
                      <div className="flex items-center gap-2">
                        <NumberField
                          id={`weight-${assessment.id}`}
                          value={assessment.weight}
                          onRawChange={(raw) => assessment.id && onWeightChange(assessment.id, raw)}
                          className="text-right tabular-nums"
                        />
                        <span className="shrink-0 text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor={`mark-${assessment.id}`}
                        className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        Mark
                      </label>
                      <div className="flex items-center gap-2">
                        <NumberField
                          id={`mark-${assessment.id}`}
                          value={assessment.mark ?? null}
                          onRawChange={(raw) => assessment.id && onMarkChange(assessment.id, raw)}
                          placeholder="--"
                          className="text-right tabular-nums"
                        />
                        <span className="shrink-0 text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-sm text-muted-foreground">Points contribution</span>
                    <span className="text-base font-semibold tabular-nums text-foreground">
                      {contribution}
                    </span>
                  </div>
                </div>

                {/* Desktop layout — same grid template as the header, one cell per column */}
                <div className={gradeGridClass}>
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-medium text-foreground">
                      {assessment.assignmentName}
                    </h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Due {formatLocalDate(assessment.dueDate)}
                    </p>
                  </div>
                  <div>
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full",
                        status.tintClass,
                      )}
                      title={status.label}
                    >
                      <StatusIcon className="size-4" aria-hidden />
                      <span className="sr-only">{status.label}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <NumberField
                      value={assessment.weight}
                      onRawChange={(raw) => assessment.id && onWeightChange(assessment.id, raw)}
                      aria-label="Weight"
                      className="h-9 w-20 px-2 text-right tabular-nums"
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <NumberField
                      value={assessment.mark ?? null}
                      onRawChange={(raw) => assessment.id && onMarkChange(assessment.id, raw)}
                      placeholder="--"
                      aria-label="Mark"
                      className="h-9 w-20 px-2 text-right tabular-nums"
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                  <p className="text-right text-sm font-medium tabular-nums text-foreground">
                    {contribution}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
);

export default AssessmentBreakdown;
