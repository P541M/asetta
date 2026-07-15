import { ChartColumn, CircleAlert, CircleCheck, CircleDashed, type LucideIcon } from "lucide-react";
import { Assessment } from "../../../types/assessment";
import { cn } from "@/lib/utils";
import { Input } from "../../ui/input";
import EmptyState from "../../ui/EmptyState";
import { statusTintClasses } from "../../tables/assessments/StatusSelect";

interface AssessmentBreakdownProps {
  assessments: Assessment[];
  onWeightChange: (assessmentId: string, value: string) => void;
  onMarkChange: (assessmentId: string, value: string) => void;
}

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

const hideNumberSpinners =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

/** Editable weight/mark list for all assessments in the selected course. */
const AssessmentBreakdown = ({
  assessments,
  onWeightChange,
  onMarkChange,
}: AssessmentBreakdownProps) => (
  <div>
    <div className="mb-4">
      <h3 className="text-base font-semibold text-foreground">Assessment breakdown</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Edit weights and marks to calculate your grade
      </p>
    </div>

    {assessments.length === 0 ? (
      <EmptyState
        icon={<ChartColumn className="size-12" aria-hidden />}
        title="No assessments found"
        description="This course doesn't have any assessments yet."
        className="py-10"
      />
    ) : (
      <div className="space-y-4">
        {/* Desktop headers - hidden on mobile */}
        <div className="hidden grid-cols-12 gap-4 px-4 pb-1 lg:grid">
          <span className="col-span-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Assessment
          </span>
          <span className="col-span-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Status
          </span>
          <span className="col-span-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Weight
          </span>
          <span className="col-span-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Mark
          </span>
          <span className="col-span-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Points
          </span>
        </div>

        <div className="space-y-3">
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
                className="rounded-xl bg-secondary/50 p-4 transition-colors hover:bg-accent/50"
              >
                {/* Mobile layout */}
                <div className="space-y-4 lg:hidden">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-semibold leading-tight text-foreground">
                        {assessment.assignmentName}
                      </h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Due: {new Date(assessment.dueDate).toLocaleDateString()}
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
                        <Input
                          id={`weight-${assessment.id}`}
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={assessment.weight}
                          onChange={(e) =>
                            assessment.id && onWeightChange(assessment.id, e.target.value)
                          }
                          className={hideNumberSpinners}
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
                        <Input
                          id={`mark-${assessment.id}`}
                          type="number"
                          min="0"
                          step="0.1"
                          value={assessment.mark ?? ""}
                          onChange={(e) =>
                            assessment.id && onMarkChange(assessment.id, e.target.value)
                          }
                          placeholder="--"
                          className={hideNumberSpinners}
                        />
                        <span className="shrink-0 text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-sm text-muted-foreground">Points contribution</span>
                    <span className="text-base font-semibold text-foreground">{contribution}</span>
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden grid-cols-12 items-center gap-4 lg:grid">
                  <div className="col-span-4">
                    <h4 className="text-sm font-medium text-foreground">
                      {assessment.assignmentName}
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Due: {new Date(assessment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="col-span-2">
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
                  <div className="col-span-2 flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={assessment.weight}
                      onChange={(e) =>
                        assessment.id && onWeightChange(assessment.id, e.target.value)
                      }
                      aria-label="Weight"
                      className={cn("h-9 w-20 px-2", hideNumberSpinners)}
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={assessment.mark ?? ""}
                      onChange={(e) => assessment.id && onMarkChange(assessment.id, e.target.value)}
                      placeholder="--"
                      aria-label="Mark"
                      className={cn("h-9 w-20 px-2", hideNumberSpinners)}
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-foreground">{contribution}</span>
                  </div>
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
