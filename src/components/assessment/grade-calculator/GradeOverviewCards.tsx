import { GradeInfo, getProgressBarColor } from "../../../utils/gradeCalculations";

interface GradeOverviewCardsProps {
  currentGrade: number | null;
  currentGradeInfo: GradeInfo | null;
  totalWeight: number;
  targetGrade: number;
  onTargetGradeChange: (value: number) => void;
  preferencesLoading: boolean;
  requiredGrade: number | null;
}

/** The three summary cards: current grade, course weight, target grade + projection. */
const GradeOverviewCards = ({
  currentGrade,
  currentGradeInfo,
  totalWeight,
  targetGrade,
  onTargetGradeChange,
  preferencesLoading,
  requiredGrade,
}: GradeOverviewCardsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* Current Grade */}
    <div className="bg-light-bg-primary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary rounded-lg p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary">
          Current Grade
        </h3>
        {currentGradeInfo && (
          <span
            className={`px-2 py-1 rounded-sm text-xs font-medium ${currentGradeInfo.bgColor} ${currentGradeInfo.color}`}
          >
            {currentGradeInfo.letter}
          </span>
        )}
      </div>
      {currentGrade !== null ? (
        <div className="space-y-3">
          <div className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary">
            {currentGrade.toFixed(1)}%
          </div>
          <div className="w-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${getProgressBarColor(
                currentGrade,
              )}`}
              style={{ width: `${Math.min(currentGrade, 100)}%` }}
            ></div>
          </div>
          {currentGradeInfo && (
            <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
              GPA: {currentGradeInfo.gpa}
            </p>
          )}
        </div>
      ) : (
        <div className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">
          No completed assessments yet
        </div>
      )}
    </div>

    {/* Course Weight */}
    <div className="bg-light-bg-primary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary rounded-lg p-6">
      <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
        Course Weight
      </h3>
      <div className="space-y-3">
        <div className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary">
          {totalWeight.toFixed(2)}%
        </div>
        <div className="w-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              totalWeight === 100
                ? "bg-light-performance-excellent-bg dark:bg-dark-performance-excellent-bg"
                : totalWeight >= 90
                  ? "bg-light-performance-average-bg dark:bg-dark-performance-average-bg"
                  : "bg-light-performance-poor-bg dark:bg-dark-performance-poor-bg"
            }`}
            style={{ width: `${Math.min(totalWeight, 100)}%` }}
          ></div>
        </div>
        <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
          {totalWeight === 100
            ? "Complete"
            : totalWeight > 100
              ? "Over 100%"
              : `${(100 - totalWeight).toFixed(2)}% remaining`}
        </p>
      </div>
    </div>

    {/* Target Grade & Projection */}
    <div className="bg-light-bg-primary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary rounded-lg p-6">
      <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
        Target Grade
      </h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="0"
            max="100"
            value={targetGrade}
            onChange={(e) => onTargetGradeChange(parseFloat(e.target.value) || 0)}
            disabled={preferencesLoading}
            className="input w-20 sm:w-16 px-3 py-2 sm:px-2 sm:py-1 text-base sm:text-sm hover:shadow-sm transition-all duration-200 dark:bg-dark-input-bg dark:text-dark-input-text dark:border-dark-input-border min-h-[44px] sm:min-h-auto disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">%</span>
        </div>
        {requiredGrade !== null && (
          <div className="text-sm">
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Need avg of{" "}
              <span
                className={`font-medium ${
                  requiredGrade > 100
                    ? "text-light-status-overdue-text dark:text-dark-status-overdue-text"
                    : "text-light-status-submitted-text dark:text-dark-status-submitted-text"
                }`}
              >
                {requiredGrade.toFixed(1)}%
              </span>
            </p>
            <p className="text-light-text-tertiary dark:text-dark-text-tertiary">
              on remaining assessments
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default GradeOverviewCards;
