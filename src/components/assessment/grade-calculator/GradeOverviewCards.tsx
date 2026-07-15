import { GradeInfo, getProgressBarColor } from "../../../utils/gradeCalculations";
import { cn } from "@/lib/utils";
import { Input } from "../../ui/input";

interface GradeOverviewCardsProps {
  currentGrade: number | null;
  currentGradeInfo: GradeInfo | null;
  totalWeight: number;
  targetGrade: number;
  onTargetGradeChange: (value: number) => void;
  preferencesLoading: boolean;
  requiredGrade: number | null;
}

/** Weight completeness is a checklist, not a grade: full = success, over = error, else in progress. */
const weightBarColor = (totalWeight: number) =>
  totalWeight === 100 ? "bg-success" : totalWeight > 100 ? "bg-destructive" : "bg-primary";

/** The three summary tiles: current grade, course weight, target grade + projection. */
const GradeOverviewCards = ({
  currentGrade,
  currentGradeInfo,
  totalWeight,
  targetGrade,
  onTargetGradeChange,
  preferencesLoading,
  requiredGrade,
}: GradeOverviewCardsProps) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
    {/* Current grade */}
    <div className="rounded-xl bg-secondary/50 p-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Current grade</h3>
        {currentGradeInfo && (
          <span
            className={cn(
              "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium",
              currentGradeInfo.tintClass,
            )}
          >
            {currentGradeInfo.letter}
          </span>
        )}
      </div>
      {currentGrade !== null ? (
        <div className="space-y-3">
          <div className="text-xl font-semibold text-foreground md:text-2xl">
            {currentGrade.toFixed(1)}%
          </div>
          <div className="h-1.5 w-full rounded-full bg-foreground/10">
            <div
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                getProgressBarColor(currentGrade),
              )}
              style={{ width: `${Math.min(currentGrade, 100)}%` }}
            />
          </div>
          {currentGradeInfo && (
            <p className="text-sm text-muted-foreground">GPA: {currentGradeInfo.gpa}</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No completed assessments yet</p>
      )}
    </div>

    {/* Course weight */}
    <div className="rounded-xl bg-secondary/50 p-6">
      <h3 className="mb-3 text-sm font-medium text-foreground">Course weight</h3>
      <div className="space-y-3">
        <div className="text-xl font-semibold text-foreground md:text-2xl">
          {totalWeight.toFixed(2)}%
        </div>
        <div className="h-1.5 w-full rounded-full bg-foreground/10">
          <div
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              weightBarColor(totalWeight),
            )}
            style={{ width: `${Math.min(totalWeight, 100)}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {totalWeight === 100
            ? "Complete"
            : totalWeight > 100
              ? "Over 100%"
              : `${(100 - totalWeight).toFixed(2)}% remaining`}
        </p>
      </div>
    </div>

    {/* Target grade & projection */}
    <div className="rounded-xl bg-secondary/50 p-6">
      <h3 className="mb-3 text-sm font-medium text-foreground">Target grade</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            max="100"
            value={targetGrade}
            onChange={(e) => onTargetGradeChange(parseFloat(e.target.value) || 0)}
            disabled={preferencesLoading}
            aria-label="Target grade"
            className="w-24 px-3"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
        {requiredGrade !== null && (
          <div className="text-sm">
            <p className="text-foreground">
              Need avg of{" "}
              <span
                className={cn(
                  "font-medium",
                  requiredGrade > 100 ? "text-destructive" : "text-success",
                )}
              >
                {requiredGrade.toFixed(1)}%
              </span>
            </p>
            <p className="text-muted-foreground">on remaining assessments</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default GradeOverviewCards;
