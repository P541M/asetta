import { useState } from "react";
import type React from "react";
import { useAuth } from "../contexts/AuthContext";
import { UploadStatus } from "../types/upload";
import { RETRY_AFTER_SECONDS } from "../lib/upload/constants";
import {
  failedUpload,
  parseUploadResponse,
  pdfSelection,
  postUploadForm,
  uploadOutcome,
  type UploadOutcome,
} from "../lib/uploadClient";

/**
 * The state and actions both upload forms share (the Add tab's and onboarding's); each keeps its
 * own markup. The listed PDFs live here and are what an upload sends: the file input only picks,
 * and is emptied after each pick so the same file can be picked again.
 */
export function useSyllabusUpload(semesterId: string) {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [pickError, setPickError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [outcome, setOutcome] = useState<UploadOutcome | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [copyrightAgreed, setCopyrightAgreed] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const status: UploadStatus = uploading ? "uploading" : (outcome?.status ?? "idle");
  // Nothing is sent twice: not during an upload, not after a success, not past the day's limit
  const canUpload =
    user !== null &&
    files.length > 0 &&
    copyrightAgreed &&
    (status === "idle" || status === "error" || status === "rate_limited");

  const select = (picked: File[]) => {
    const selection = pdfSelection(picked);
    if (!selection || uploading) return;
    // A refused pick changes nothing else, so files a success already sent stay out of the list
    if ("error" in selection) {
      setPickError(selection.error);
      if (selection.clearList) setFiles([]);
      return;
    }
    // New files start over, whatever the last upload ended in
    setOutcome(null);
    setPickError("");
    setFiles(selection.files);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    select(Array.from(e.target.files ?? []));
    e.target.value = "";
  };

  const dropZoneProps = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // dragleave also fires when the pointer moves onto a child; only leaving the zone counts
      const rect = e.currentTarget.getBoundingClientRect();
      const { clientX: x, clientY: y } = e;
      if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
        setIsDragActive(false);
      }
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      select(Array.from(e.dataTransfer.files));
    },
  };

  const upload = async (): Promise<UploadOutcome | null> => {
    if (!user || !canUpload) return null;

    setUploading(true);
    setPickError("");
    setOutcome(null);

    let next: UploadOutcome;
    try {
      const response = await postUploadForm(user, semesterId, files);
      next = uploadOutcome(await parseUploadResponse(response), new Date());
    } catch (err) {
      console.error("Upload error:", err);
      next = failedUpload(err instanceof Error ? err.message : "Upload failed");
    }

    setUploading(false);
    setOutcome(next);
    if (next.status === "success") setResultOpen(true);
    if ("limit" in next && next.limit) setLimitModalOpen(true);
    return next;
  };

  const reset = () => {
    setFiles([]);
    setPickError("");
    setOutcome(null);
    setResultOpen(false);
    setLimitModalOpen(false);
    setCopyrightAgreed(false);
  };

  return {
    files,
    status,
    canUpload,
    message: outcome?.status === "success" ? outcome.message : "",
    error: pickError || (outcome && outcome.status !== "success" ? outcome.error : ""),
    result: outcome?.status === "success" ? outcome.result : null,
    resultOpen,
    retryAfter: outcome?.status === "rate_limited" ? outcome.retryAfter : RETRY_AFTER_SECONDS,
    limitModalOpen,
    quota: outcome && "limit" in outcome ? (outcome.limit?.quota ?? null) : null,
    copyrightAgreed,
    isDragActive,
    setCopyrightAgreed,
    onInputChange,
    dropZoneProps,
    upload,
    reset,
    closeResult: () => setResultOpen(false),
    closeLimitModal: () => setLimitModalOpen(false),
  };
}
