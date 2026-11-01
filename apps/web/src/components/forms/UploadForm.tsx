import { CircleAlert, CircleCheck, CloudUpload, FileText, Loader2, Zap } from "lucide-react";
import { UploadFormProps } from "../../types/upload";
import { cn } from "@/lib/utils";
import { useSyllabusUpload } from "../../hooks/useSyllabusUpload";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import RateLimitNotice from "../ui/RateLimitNotice";
import ExtractionSuccessModal from "../modals/ExtractionSuccessModal";
import ApiLimitReachedModal from "../modals/ApiLimitReachedModal";
import CopyrightAgreement from "./CopyrightAgreement";
import { ACCEPTED_MIME_TYPE, MAX_FILE_BYTES, formatBytes } from "../../lib/upload/constants";

const UploadForm = ({ semesterId }: UploadFormProps) => {
  const {
    files: picked,
    status: uploadStatus,
    canUpload,
    message,
    error,
    result,
    resultOpen,
    retryAfter,
    limitModalOpen,
    quota,
    copyrightAgreed,
    isDragActive,
    setCopyrightAgreed,
    onInputChange,
    dropZoneProps,
    upload,
    reset,
    closeResult,
    closeLimitModal,
  } = useSyllabusUpload(semesterId);
  // Uploaded files leave the list; the next pick starts a new one
  const files = uploadStatus === "success" ? [] : picked;

  return (
    <div>
      <div className="mb-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          Transform your PDF course outlines into organized assessments automatically. Our AI
          extracts deadlines, requirements, and details in seconds.
        </p>

        <Alert>
          <AlertTitle>Automatic extraction</AlertTitle>
          <AlertDescription>
            Verify the imported details before saving. Files are processed securely and discarded
            immediately.
          </AlertDescription>
        </Alert>
      </div>

      <div className="space-y-6">
        <div
          {...dropZoneProps}
          className={cn(
            "relative rounded-xl border-2 border-dashed p-8 text-center transition-colors",
            isDragActive ? "border-primary bg-primary/5" : "border-border bg-secondary/30",
            uploadStatus === "uploading" ? "cursor-not-allowed opacity-75" : "cursor-pointer",
          )}
        >
          <input
            type="file"
            multiple
            accept={ACCEPTED_MIME_TYPE}
            onChange={onInputChange}
            disabled={uploadStatus === "uploading"}
            aria-label="Upload PDF course outlines"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />

          <div className="space-y-4">
            <div
              className={cn(
                "mx-auto flex size-16 items-center justify-center rounded-full transition-colors",
                isDragActive ? "bg-primary/10" : "bg-secondary",
              )}
            >
              {uploadStatus === "uploading" ? (
                <Loader2 className="size-8 text-primary motion-safe:animate-spin" aria-hidden />
              ) : (
                <CloudUpload
                  className={cn(
                    "size-8 transition-colors",
                    isDragActive ? "text-primary" : "text-muted-foreground",
                  )}
                  aria-hidden
                />
              )}
            </div>

            <div>
              <h4
                className={cn(
                  "text-base font-semibold transition-colors",
                  isDragActive ? "text-primary" : "text-foreground",
                )}
              >
                {isDragActive ? "Drop your PDFs here" : "Drop PDFs or click to browse"}
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                {uploadStatus === "uploading"
                  ? "Processing your files..."
                  : `Supports multiple PDF files · Max ${formatBytes(MAX_FILE_BYTES)} per file`}
              </p>
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-foreground">Ready to process</h4>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {files.length} file{files.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid gap-3">
              {files.map((file, index) => (
                <div key={index} className="rounded-xl bg-secondary/50 p-4">
                  <div className="flex items-center gap-4">
                    <FileText className="size-8 shrink-0 text-muted-foreground" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                      <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                        {formatBytes(file.size)} · PDF
                      </p>
                    </div>
                    <div className="shrink-0">
                      {uploadStatus === "uploading" ? (
                        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden />
                          Processing...
                        </span>
                      ) : (
                        <CircleCheck className="size-5 text-success" aria-hidden />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {message && !resultOpen && (
          <Alert variant="success">
            <CircleCheck aria-hidden />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {uploadStatus === "rate_limited" ? (
          <RateLimitNotice onRetry={upload} retryAfter={retryAfter} autoRetry={true} />
        ) : (
          error && (
            <Alert variant="destructive">
              <CircleAlert aria-hidden />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )
        )}

        {files.length > 0 && uploadStatus === "idle" && (
          <CopyrightAgreement
            id="upload-copyright-agreement"
            checked={copyrightAgreed}
            onChange={setCopyrightAgreed}
          />
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            onClick={upload}
            // While rate limited, the notice above retries
            disabled={!canUpload || uploadStatus === "rate_limited"}
            className="flex-1"
          >
            {uploadStatus === "uploading" ? (
              <>
                <Loader2 className="motion-safe:animate-spin" aria-hidden />
                Processing files...
              </>
            ) : (
              <>
                <Zap aria-hidden />
                Extract assessments
              </>
            )}
          </Button>

          {files.length > 0 && uploadStatus !== "uploading" && (
            <Button type="button" variant="secondary" onClick={reset}>
              {uploadStatus === "rate_limited" ? "Cancel and clear" : "Clear files"}
            </Button>
          )}
        </div>
      </div>

      {resultOpen && result && (
        <ExtractionSuccessModal
          isOpen
          onClose={closeResult}
          result={result}
          semesterId={semesterId}
        />
      )}

      <ApiLimitReachedModal isOpen={limitModalOpen} onClose={closeLimitModal} quota={quota} />
    </div>
  );
};

export default UploadForm;
