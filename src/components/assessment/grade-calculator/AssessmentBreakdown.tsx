import { Assessment } from "../../../types/assessment";
import EmptyState from "../../ui/EmptyState";

interface AssessmentBreakdownProps {
  assessments: Assessment[];
  onWeightChange: (assessmentId: string, value: string) => void;
  onMarkChange: (assessmentId: string, value: string) => void;
}

/** Status badge (icon + colors) for a row in the breakdown list. */
const getAssessmentStatus = (assessment: Assessment) => {
  const now = new Date();
  const dueDate = new Date(`${assessment.dueDate}T${assessment.dueTime}`);

  if (assessment.status === "Submitted") {
    return {
      icon: "✓",
      color: "text-light-status-submitted-text dark:text-dark-status-submitted-text",
      bgColor: "bg-light-status-submitted-bg dark:bg-dark-status-submitted-bg",
    };
  } else if (dueDate < now) {
    return {
      icon: "!",
      color: "text-light-status-overdue-text dark:text-dark-status-overdue-text",
      bgColor: "bg-light-status-overdue-bg dark:bg-dark-status-overdue-bg",
    };
  } else {
    return {
      icon: "○",
      color: "text-light-status-pending-text dark:text-dark-status-pending-text",
      bgColor: "bg-light-status-pending-bg dark:bg-dark-status-pending-bg",
    };
  }
};

/** Editable weight/mark table for all assessments in the selected course. */
const AssessmentBreakdown = ({
  assessments,
  onWeightChange,
  onMarkChange,
}: AssessmentBreakdownProps) => (
  <div className="bg-light-bg-primary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary rounded-lg">
    <div className="px-6 py-4 border-b border-light-border-primary dark:border-dark-border-primary">
      <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary">
        Assessment Breakdown
      </h3>
      <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
        Edit weights and marks to calculate your grade
      </p>
    </div>

    <div className="p-6">
      {assessments.length === 0 ? (
        <EmptyState
          icon={
            <svg
              className="mx-auto h-12 w-12 text-light-text-tertiary dark:text-dark-text-tertiary mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
          title="No assessments found"
          description="This course doesn't have any assessments yet."
          className="py-10 text-light-text-tertiary dark:text-dark-text-tertiary"
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Headers - Hidden on mobile */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3 bg-light-bg-secondary/50 dark:bg-dark-bg-tertiary/50 rounded-lg">
            <div className="col-span-4 flex items-center">
              <span className="text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                Assessment
              </span>
            </div>
            <div className="col-span-2 flex items-center">
              <span className="text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                Status
              </span>
            </div>
            <div className="col-span-2 flex items-center">
              <span className="text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                Weight
              </span>
            </div>
            <div className="col-span-2 flex items-center">
              <span className="text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                Mark
              </span>
            </div>
            <div className="col-span-2 flex items-center">
              <span className="text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                Points
              </span>
            </div>
          </div>

          {/* Assessment Cards */}
          <div className="space-y-3">
            {assessments.map((assessment) => {
              const status = getAssessmentStatus(assessment);
              const contribution =
                assessment.mark && assessment.weight
                  ? ((assessment.mark * assessment.weight) / 100).toFixed(1)
                  : "0.0";

              return (
                <div
                  key={assessment.id}
                  className="bg-light-bg-secondary/50 dark:bg-dark-bg-tertiary/30 rounded-lg transition-all duration-300 p-4 hover:bg-light-hover-primary/50 dark:hover:bg-dark-hover-primary/50"
                >
                  {/* Mobile Layout */}
                  <div className="lg:hidden space-y-4">
                    {/* Assessment Name and Due Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary text-base leading-tight">
                          {assessment.assignmentName}
                        </h3>
                        <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                          Due: {new Date(assessment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${status.bgColor} ${status.color} flex-shrink-0 ml-3`}
                        title={assessment.status}
                      >
                        {status.icon}
                      </span>
                    </div>

                    {/* Input Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider mb-2">
                          Weight
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={assessment.weight}
                            onChange={(e) =>
                              assessment.id && onWeightChange(assessment.id, e.target.value)
                            }
                            className="input w-full px-4 py-3 text-base hover:shadow-sm transition-all duration-200 dark:bg-dark-input-bg dark:text-dark-input-text dark:border-dark-input-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-h-[44px] rounded-lg"
                          />
                          <span className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary flex-shrink-0">
                            %
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider mb-2">
                          Mark
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={assessment.mark ?? ""}
                            onChange={(e) =>
                              assessment.id && onMarkChange(assessment.id, e.target.value)
                            }
                            className="input w-full px-4 py-3 text-base hover:shadow-sm transition-all duration-200 dark:bg-dark-input-bg dark:text-dark-input-text dark:border-dark-input-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-h-[44px] rounded-lg"
                            placeholder="--"
                          />
                          <span className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary flex-shrink-0">
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Points Contribution */}
                    <div className="flex items-center justify-between pt-2 border-t border-light-border-primary/50 dark:border-dark-border-primary/50">
                      <span className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                        Points Contribution:
                      </span>
                      <span className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary">
                        {contribution}
                      </span>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4">
                      <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary text-sm">
                        {assessment.assignmentName}
                      </h3>
                      <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                        Due: {new Date(assessment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${status.bgColor} ${status.color}`}
                        title={assessment.status}
                      >
                        {status.icon}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={assessment.weight}
                          onChange={(e) =>
                            assessment.id && onWeightChange(assessment.id, e.target.value)
                          }
                          className="input w-16 px-2 py-1 text-sm hover:shadow-sm transition-all duration-200 dark:bg-dark-input-bg dark:text-dark-input-text dark:border-dark-input-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                          %
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={assessment.mark ?? ""}
                          onChange={(e) =>
                            assessment.id && onMarkChange(assessment.id, e.target.value)
                          }
                          className="input w-16 px-2 py-1 text-sm hover:shadow-sm transition-all duration-200 dark:bg-dark-input-bg dark:text-dark-input-text dark:border-dark-input-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="--"
                        />
                        <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                          %
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                        {contribution}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  </div>
);

export default AssessmentBreakdown;
