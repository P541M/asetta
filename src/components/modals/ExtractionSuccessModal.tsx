import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/router";
import { CalendarDays, Clock, Info, ListChecks, Plus, X } from "lucide-react";
import { ExtractionResult } from "../../types/upload";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";

interface ExtractionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ExtractionResult;
  semesterId: string;
}

const COURSE_DISPLAY_LIMIT = 3;

const ExtractionSuccessModal: React.FC<ExtractionSuccessModalProps> = ({
  isOpen,
  onClose,
  result,
  semesterId,
}) => {
  const router = useRouter();

  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleViewAssessments = () => {
    onClose();
    router.push(`/dashboard/${semesterId}/assessments`);
  };

  const handleGoToCalendar = () => {
    onClose();
    router.push(`/dashboard/${semesterId}/calendar`);
  };

  const hiddenCourseCount = (result.courseBreakdown?.length ?? 0) - COURSE_DISPLAY_LIMIT;

  const modalContent = (
    <div
      className="fixed inset-0 z-150 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-card shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-label="Extraction complete"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pb-1 pt-4">
          <h3 className="text-base font-semibold text-foreground">Extraction complete</h3>
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
        <div className="px-5 pb-5">
          <p className="text-sm text-muted-foreground">Your course outline has been processed.</p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-secondary/50 p-3 text-center">
              <div className="text-xl font-semibold text-foreground">{result.processedFiles}</div>
              <div className="text-xs font-medium text-muted-foreground">
                File{result.processedFiles !== 1 ? "s" : ""} processed
              </div>
            </div>
            <div className="rounded-xl bg-secondary/50 p-3 text-center">
              <div className="text-xl font-semibold text-foreground">{result.totalAssessments}</div>
              <div className="text-xs font-medium text-muted-foreground">
                Assessment{result.totalAssessments !== 1 ? "s" : ""} found
              </div>
            </div>
          </div>

          {result.courseBreakdown && result.courseBreakdown.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Courses detected</p>
              <div className="rounded-xl bg-secondary/50 p-1.5">
                {result.courseBreakdown.slice(0, COURSE_DISPLAY_LIMIT).map((course, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2"
                  >
                    <span className="truncate text-sm font-medium text-foreground">
                      {course.courseName}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {course.assessmentCount} assessment{course.assessmentCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
                {hiddenCourseCount > 0 && (
                  <p className="px-2.5 py-2 text-center text-xs text-muted-foreground">
                    and {hiddenCourseCount} other{hiddenCourseCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
          )}

          {result.processingTime && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Clock className="size-3" aria-hidden />
              <span>Processed in {result.processingTime}s</span>
            </div>
          )}

          <Alert className="mt-4">
            <Info aria-hidden />
            <AlertTitle>Review your data</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              AI extraction may not be 100% accurate. Check your assessments and edit any incorrect
              details.
            </AlertDescription>
          </Alert>

          <div className="mt-5 space-y-2">
            <Button type="button" className="w-full" onClick={handleViewAssessments}>
              <ListChecks aria-hidden />
              Review your assessments
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                <Plus aria-hidden />
                Add more
              </Button>
              <Button type="button" variant="secondary" onClick={handleGoToCalendar}>
                <CalendarDays aria-hidden />
                Calendar
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={onClose}
            >
              I&apos;ll do this later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ExtractionSuccessModal;
