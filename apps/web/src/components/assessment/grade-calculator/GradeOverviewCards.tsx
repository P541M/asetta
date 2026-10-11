import { currentGradeView, requiredGradeView } from "../../../utils/gradeCalculations";
import { cn } from "@/lib/utils";
import NumberField from "./NumberField";

interface GradeOverviewCardsProps {
  /** Null until graded assessments carry some weight. */
  currentGrade: number | null;
  totalWeight: number;
  targetGrade: number;
  onTargetGradeChange: (value: number) => void;
  preferencesLoading: boolean;
  /** Null when nothing weighted is left to grade. */
  requiredGrade: number | null;
}

/** Weight completeness is a checklist, not a grade: full = success, over = error, else in progress. */
const weightBarColor = (totalWeight: number) =>
  totalWeight === 100 ? "bg-success" : totalWeight > 100 ? "bg-destructive" : "bg-primary";

/**
 * The three summary tiles: current grade, course weight, target grade +
 * projection. One shared anatomy so the set reads as a unit: caption label
 * row, a fixed h-9 value row (number or the target input — tops align by
 * construction), optional meter, and a caption support line pinned to the
 * tile bottom.
 */
const GradeOverviewCards = ({
  currentGrade,
  totalWeight,
  targetGrade,
  onTargetGradeChange,
  preferencesLoading,
  requiredGrade,
}: GradeOverviewCardsProps) => {
  const current = currentGrade !== null ? currentGradeView(currentGrade) : null;
  const required = requiredGrade !== null ? requiredGradeView(requiredGrade) : null;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {/* Current grade */}
      <div className="flex flex-col rounded-xl bg-secondary/50 p-4">
        <div className="flex min-h-5 items-center justify-between gap-2">
          <h3 className="text-xs font-medium text-muted-foreground">Current grade</h3>
          {current && (
            <span
              className={cn(
                "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium",
                current.info.tintClass,
              )}
            >
              {current.info.letter}
            </span>
          )}
        </div>
        <div className="mt-1 flex h-9 items-center">
          {current ? (
            <p className="text-xl font-semibold tabular-nums text-foreground md:text-2xl">
              {current.text}%
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No weighted marks yet</p>
          )}
        </div>
        {current && (
          <div className="mt-2 h-1.5 w-full rounded-full bg-foreground/10">
            <div
              className={cn("h-1.5 rounded-full transition-all duration-300", current.barColor)}
              style={{ width: `${Math.min(current.value, 100)}%` }}
            />
          </div>
        )}
        {current && (
          <p className="mt-auto pt-2 text-xs font-medium text-muted-foreground">
            GPA: {current.info.gpa}
          </p>
        )}
      </div>

      {/* Course weight */}
      <div className="flex flex-col rounded-xl bg-secondary/50 p-4">
        <div className="flex min-h-5 items-center">
          <h3 className="text-xs font-medium text-muted-foreground">Course weight</h3>
        </div>
        <div className="mt-1 flex h-9 items-center">
          <p className="text-xl font-semibold tabular-nums text-foreground md:text-2xl">
            {totalWeight.toFixed(2)}%
          </p>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-foreground/10">
          <div
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              weightBarColor(totalWeight),
            )}
            style={{ width: `${Math.min(totalWeight, 100)}%` }}
          />
        </div>
        <p className="mt-auto pt-2 text-xs font-medium text-muted-foreground">
          {totalWeight === 100
            ? "Complete"
            : totalWeight > 100
              ? "Over 100%"
              : `${(100 - totalWeight).toFixed(2)}% remaining`}
        </p>
      </div>

      {/* Target grade & projection */}
      <div className="flex flex-col rounded-xl bg-secondary/50 p-4">
        <div className="flex min-h-5 items-center">
          <h3 className="text-xs font-medium text-muted-foreground">Target grade</h3>
        </div>
        <div className="mt-1 flex h-9 items-center gap-2">
          <NumberField
            value={targetGrade}
            onRawChange={(raw) => onTargetGradeChange(parseFloat(raw) || 0)}
            disabled={preferencesLoading}
            aria-label="Target grade"
            className="h-9 w-20 px-3 text-right tabular-nums"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
        {required?.kind === "secured" && (
          <p className="mt-auto pt-2 text-xs font-medium text-success">Target already secured</p>
        )}
        {required?.kind === "needed" && (
          <p className="mt-auto pt-2 text-xs font-medium text-muted-foreground">
            Need{" "}
            <span
              className={cn(
                "tabular-nums",
                required.reachable ? "text-success" : "text-destructive",
              )}
            >
              {required.text}%
            </span>{" "}
            average on remaining assessments
          </p>
        )}
      </div>
    </div>
  );
};

export default GradeOverviewCards;
