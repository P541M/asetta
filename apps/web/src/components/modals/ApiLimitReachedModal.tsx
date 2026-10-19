import React from "react";
import { createPortal } from "react-dom";
import { Clock, X } from "lucide-react";
import { Button } from "../ui/button";
import { useScrollLock } from "../../hooks/useScrollLock";
import { MAX_FILES_PER_DAY } from "../../lib/upload/constants";
import { uploadLimitResetText, type UploadQuota } from "../../lib/uploadClient";

interface ApiLimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The account's own daily limit (A18); without it, the copy is about Gemini's shared quota. */
  quota?: UploadQuota | null;
}

const ApiLimitReachedModal: React.FC<ApiLimitReachedModalProps> = ({ isOpen, onClose, quota }) => {
  useScrollLock(isOpen);

  if (!isOpen) return null;

  const title = quota ? "Daily upload limit" : "Daily limit reached";

  const modalContent = (
    <div
      className="fixed inset-0 z-150 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-card shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pb-1 pt-4">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
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
          {quota ? (
            <p className="text-sm text-muted-foreground">
              Each account can upload {MAX_FILES_PER_DAY} files a day, which keeps AI extraction
              available for everyone.{" "}
              {quota.remaining > 0
                ? `You have ${quota.remaining} left today, so choose ${quota.remaining} or fewer and try again.`
                : `You've used all ${MAX_FILES_PER_DAY} for today.`}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Our AI document processing has reached its daily capacity. This helps us keep the
              service reliable for everyone.
            </p>
          )}

          <div className="mt-4 rounded-xl bg-secondary/50 p-4">
            <div className="flex items-center gap-2">
              <Clock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="text-sm font-medium text-foreground">
                {quota
                  ? uploadLimitResetText(quota.resetsAt, new Date())
                  : "Limits refresh at midnight UTC"}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {quota
                ? `Then you can upload ${MAX_FILES_PER_DAY} more files.`
                : "Check back tomorrow to keep using AI extraction."}
            </p>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-foreground">What you can do now</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Add assessments manually with the quick add form</li>
              <li>Review and manage your existing assessments</li>
              <li>
                {quota
                  ? "Come back after the reset to upload more"
                  : "Come back tomorrow for AI extraction"}
              </li>
            </ul>
          </div>

          <Button type="button" className="mt-5 w-full" onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ApiLimitReachedModal;
