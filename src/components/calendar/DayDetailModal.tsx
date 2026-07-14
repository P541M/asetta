import { Day } from "../../types/calendar";
import { getStatusBadgeClasses } from "../../utils/statusUtils";
import { CloseSolidIcon } from "../ui/icons";

interface DayDetailModalProps {
  day: Day;
  onClose: () => void;
  formatDateTime: (date: Date, time: string) => string;
}

/** Modal listing all assessments due on the clicked day. */
const DayDetailModal = ({ day, onClose, formatDateTime }: DayDetailModalProps) => (
  <div className="modal-backdrop z-50">
    <div className="modal-container w-full max-w-2xl">
      <div className="modal-header">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-light-text-primary dark:text-dark-text-primary">
              {day.date.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h3>
            <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
              {day.assessments.length} assessment{day.assessments.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-secondary dark:hover:text-dark-text-secondary"
          >
            <CloseSolidIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="modal-content space-y-3 max-h-[60vh] overflow-y-auto">
        {day.assessments.map((assessment) => (
          <div
            key={assessment.id}
            className="p-4 rounded-lg border border-light-border-primary dark:border-dark-border-primary bg-light-bg-primary dark:bg-dark-bg-tertiary hover:shadow-sm transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-base font-medium text-light-text-primary dark:text-dark-text-primary">
                  {assessment.assignmentName}
                </h4>
                <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary font-medium">
                  {assessment.courseName}
                </p>
              </div>
              <span className={getStatusBadgeClasses(assessment.status)}>{assessment.status}</span>
            </div>
            <div className="mt-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
              <p>Due: {formatDateTime(day.date, assessment.dueTime)}</p>
              {assessment.weight > 0 && <p>Weight: {assessment.weight}%</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default DayDetailModal;
