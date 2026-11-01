import { useEffect } from "react";
import {
  CircleAlert,
  CircleCheck,
  CircleX,
  CloudUpload,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
import { ExtractionResult } from "../../types/upload";
import { cn } from "@/lib/utils";
import { useSyllabusUpload } from "../../hooks/useSyllabusUpload";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import ApiLimitReachedModal from "../modals/ApiLimitReachedModal";
import CopyrightAgreement from "../forms/CopyrightAgreement";
import { ACCEPTED_MIME_TYPE, MAX_FILE_BYTES, formatBytes } from "../../lib/upload/constants";

interface OnboardingUploadFormProps {
  semesterId: string;
  onUploadSuccess: (results: ExtractionResult) => void;
  onBusyChange?: (busy: boolean) => void;
  showGuidance?: boolean;
}

export function OnboardingUploadForm({
  semesterId,
  onUploadSuccess,
  onBusyChange,
  showGuidance = false,
}: OnboardingUploadFormProps) {
  const {
    files,
    status: uploadStatus,
    error,
    result,
    limitModalOpen,
    quota,
    copyrightAgreed,
    isDragActive,
    setCopyrightAgreed,
    onInputChange,
    dropZoneProps,
    upload,
    reset,
    closeLimitModal,
  } = useSyllabusUpload(semesterId);

  const handleUpload = async () => {
    const outcome = await upload();
    if (outcome?.status === "success") {
      onUploadSuccess(outcome.result);
    }
  };

  const message =
    uploadStatus === "uploading"
      ? "Uploading files..."
      : uploadStatus === "success"
        ? `Successfully processed ${result?.processedFiles ?? 0} file(s).`
        : "";
  const isBusy = uploadStatus === "uploading";

  useEffect(() => {
    onBusyChange?.(isBusy);
  }, [isBusy, onBusyChange]);

  return (
    <div className="w-full">
      {showGuidance && uploadStatus === "idle" && (
        <Alert className="mb-6">
          <Sparkles aria-hidden />
          <AlertTitle>What types of files work best?</AlertTitle>
          <AlertDescription>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
              <li>Course syllabi with assignment schedules</li>
              <li>Course outlines with assessment information</li>
              <li>Assignment calendars or timetables</li>
              <li>Any document containing due dates and weights</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div
        className={cn(
          "relative rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-border bg-secondary/30",
          isBusy ? "cursor-not-allowed opacity-75" : "cursor-pointer",
        )}
        {...dropZoneProps}
      >
        <input
          type="file"
          multiple
          accept={ACCEPTED_MIME_TYPE}
          onChange={onInputChange}
          aria-label="Upload course files"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          disabled={isBusy}
        />

        {files.length === 0 ? (
          <div>
            <div
              className={cn(
                "mx-auto mb-4 flex size-12 items-center justify-center rounded-full transition-colors",
                isDragActive ? "bg-primary/10" : "bg-secondary",
              )}
            >
              <CloudUpload
                className={cn(
                  "size-6 transition-colors",
                  isDragActive ? "text-primary" : "text-muted-foreground",
                )}
                aria-hidden
              />
            </div>
            <p className="text-base font-semibold text-foreground">Drop your course files here</p>
            <p className="mt-1 text-sm text-muted-foreground">or click to browse your computer</p>
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              Supports PDF files up to {formatBytes(MAX_FILE_BYTES)} each
            </p>
          </div>
        ) : (
          <div>
            <h4 className="mb-3 text-base font-semibold text-foreground">
              Selected files ({files.length})
            </h4>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 rounded-xl bg-secondary/50 p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                    <div className="min-w-0 text-left">
                      <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                      <p className="text-xs font-medium text-muted-foreground">
                        {formatBytes(file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {uploadStatus === "uploading" ? (
                      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden />
                        Processing...
                      </span>
                    ) : uploadStatus === "success" ? (
                      <CircleCheck className="size-5 text-success" aria-hidden />
                    ) : uploadStatus !== "idle" ? (
                      <CircleX className="size-5 text-destructive" aria-hidden />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {files.length > 0 && uploadStatus === "idle" && (
        <CopyrightAgreement
          id="copyright-agreement"
          checked={copyrightAgreed}
          onChange={setCopyrightAgreed}
          className="mt-4"
        />
      )}

      {files.length > 0 && uploadStatus === "idle" && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <Button type="button" variant="ghost" onClick={reset} className="text-muted-foreground">
            Clear files
          </Button>
          <Button type="button" onClick={handleUpload} disabled={!copyrightAgreed}>
            <CloudUpload aria-hidden />
            Upload and process files
          </Button>
        </div>
      )}

      {message && (
        <Alert className="mt-4">
          {isBusy ? (
            <Loader2 className="motion-safe:animate-spin" aria-hidden />
          ) : (
            <CircleCheck aria-hidden />
          )}
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <CircleAlert aria-hidden />
          <AlertDescription>
            {error}
            <div className="mt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={reset}
                className="text-destructive"
              >
                Try again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {uploadStatus === "success" && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-medium text-success">
            <CircleCheck className="size-4" aria-hidden />
            Files processed successfully
          </p>
          <Button type="button" variant="link" size="sm" onClick={reset}>
            Upload more files
          </Button>
        </div>
      )}

      <ApiLimitReachedModal isOpen={limitModalOpen} onClose={closeLimitModal} quota={quota} />
    </div>
  );
}
