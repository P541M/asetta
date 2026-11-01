import { User } from "firebase/auth";
import { ExtractionResult } from "../types/upload";
import {
  ACCEPTED_MIME_TYPE,
  formatBytes,
  MAX_TOTAL_UPLOAD_BYTES,
  RETRY_AFTER_SECONDS,
  validateUploadSelection,
} from "./upload/constants";
import { getTodayDateString } from "../utils/dateUtils";

/**
 * What a pick or a drop does to the upload list: its PDFs replace the list, or a message says why
 * not. A pick with no PDF leaves the list as it was; one over the limits empties it. Null for an
 * empty pick.
 */
export function pdfSelection<T extends { name: string; size: number; type: string }>(
  picked: T[],
): { files: T[] } | { error: string; clearList: boolean } | null {
  if (picked.length === 0) return null;
  const files = picked.filter((file) => file.type === ACCEPTED_MIME_TYPE);
  if (files.length === 0) return { error: "Please select PDF files only.", clearList: false };
  const error = validateUploadSelection(files);
  return error ? { error, clearList: true } : { files };
}

/**
 * POSTs syllabus files to /api/upload with the user's Firebase ID token and local date (the
 * server dates any assessment flagged for review with it; its own clock only knows the UTC day).
 * Read the answer with `parseUploadResponse`, so platform-level HTML errors stay readable.
 */
export async function postUploadForm(
  user: User,
  semesterId: string,
  files: File[],
): Promise<Response> {
  const token = await user.getIdToken();
  const formData = new FormData();
  formData.append("semesterId", semesterId);
  formData.append("localDate", getTodayDateString());
  files.forEach((file) => formData.append("files", file));
  return fetch("/api/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
}

export interface UploadApiPayload {
  success?: boolean;
  error?: string;
  message?: string;
  retryAfter?: number;
  /** "daily": Gemini's shared quota; "temporary": its rate limit; "user": the account's. */
  quotaType?: string;
  /** With quotaType "user": the files the account can still upload today. */
  remaining?: number;
  data?: ExtractionResult;
}

/** The account's daily upload limit, as the limit modal shows it. */
export interface UploadQuota {
  remaining: number;
  /** When the count starts over, on the browser's clock; null when the server didn't say. */
  resetsAt: Date | null;
}

/**
 * The account's limit from a 429, or null when the 429 is about Gemini's own limits. The reset
 * comes from the server's wait in seconds, so the browser's clock being off doesn't move it.
 */
export const uploadQuotaFromPayload = (
  payload: UploadApiPayload | null,
  now: Date,
): UploadQuota | null => {
  if (payload?.quotaType !== "user") return null;
  const { remaining, retryAfter } = payload;
  return {
    remaining: typeof remaining === "number" && remaining > 0 ? Math.floor(remaining) : 0,
    resetsAt:
      typeof retryAfter === "number" && retryAfter > 0
        ? new Date(now.getTime() + retryAfter * 1000)
        : null,
  };
};

/** "Resets at 8:00 PM", or "Resets tomorrow at 5:30 AM": midnight UTC in the student's own time. */
export const uploadLimitResetText = (resetsAt: Date | null, now: Date): string => {
  if (!resetsAt) return "Resets at midnight UTC";
  // Some ICU versions put a narrow no-break space before AM/PM
  const time = resetsAt
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .replace(/ /g, " ");
  return resetsAt.toDateString() === now.toDateString()
    ? `Resets at ${time}`
    : `Resets tomorrow at ${time}`;
};

export interface ParsedUploadResponse {
  ok: boolean;
  status: number;
  /** Parsed JSON body, or null when the server did not return JSON. */
  payload: UploadApiPayload | null;
  /** A user-facing message. Always populated when `ok` is false. */
  errorMessage: string | null;
}

/**
 * Maps an infrastructure-level failure (Vercel/CDN HTML error pages, proxies,
 * offline captive portals) to something a student can act on.
 *
 * The API route itself always answers with JSON, so a non-JSON body means the
 * request never reached the handler, or the handler was killed mid-flight.
 */
const describeNonJsonResponse = (status: number): string => {
  if (status === 413) {
    return `That upload is too large. Please keep each batch under ${formatBytes(
      MAX_TOTAL_UPLOAD_BYTES,
    )} and try again.`;
  }
  if (status === 504 || status === 408) {
    return "Processing took too long and timed out. Try uploading fewer files at once; one or two syllabi per upload works best.";
  }
  if (status === 502 || status === 503) {
    return "The upload service is temporarily unavailable. Please wait a moment and try again.";
  }
  if (status === 401 || status === 403) {
    return "Your session expired. Please sign in again and retry the upload.";
  }
  if (status >= 500) {
    return "Something went wrong while processing your files. Please try again, and if it keeps happening, contact support.";
  }
  return "The upload failed and the server returned an unexpected response. Please try again.";
};

/**
 * Reads an /api/upload response without ever throwing on a non-JSON body.
 *
 * `response.json()` on an HTML error page throws
 * `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`, which masked the
 * real failure (payload too large, function timeout) from users and from us.
 */
export async function parseUploadResponse(response: Response): Promise<ParsedUploadResponse> {
  const raw = await response.text().catch(() => "");

  let payload: UploadApiPayload | null = null;
  if (raw.trim().length > 0) {
    try {
      payload = JSON.parse(raw) as UploadApiPayload;
    } catch {
      payload = null;
    }
  }

  if (payload === null) {
    // Non-JSON body: the platform answered, not our handler.
    console.error("Upload failed with a non-JSON response", {
      status: response.status,
      contentType: response.headers.get("content-type"),
      bodyPreview: raw.slice(0, 200),
    });
    return {
      ok: false,
      status: response.status,
      payload: null,
      errorMessage: describeNonJsonResponse(response.status),
    };
  }

  const ok = response.ok && payload.success !== false;

  return {
    ok,
    status: response.status,
    payload,
    errorMessage: ok
      ? null
      : payload.message || payload.error || "Upload failed. Please try again.",
  };
}

/** Where an upload ends, as the forms show it. */
export type UploadOutcome =
  | { status: "success"; message: string; result: ExtractionResult }
  | { status: "rate_limited"; error: string; retryAfter: number }
  | {
      status: "error" | "daily_quota_exceeded";
      error: string;
      /**
       * Set when a daily limit stopped the upload, which opens the limit modal: the account's own
       * limit, or null for Gemini's.
       */
      limit?: { quota: UploadQuota | null };
    };

export const failedUpload = (error: string): UploadOutcome => ({ status: "error", error });

/** How an /api/upload answer ends the upload. */
export function uploadOutcome(response: ParsedUploadResponse, now: Date): UploadOutcome {
  const { ok, status, payload, errorMessage } = response;
  if (ok) {
    return {
      status: "success",
      message: payload?.message || "Upload complete.",
      result: payload?.data ?? { processedFiles: 0, totalAssessments: 0 },
    };
  }
  if (status === 429 && payload?.error === "DAILY_QUOTA_EXCEEDED") {
    const quota = uploadQuotaFromPayload(payload, now);
    return {
      // With files left today, Extract stays enabled so the student can pick fewer
      status: quota && quota.remaining > 0 ? "error" : "daily_quota_exceeded",
      error: payload.message || "Daily processing limit reached",
      limit: { quota },
    };
  }
  if (status === 429 && payload?.error === "RATE_LIMITED") {
    return {
      status: "rate_limited",
      error: payload.message || "Servers are busy. Please wait and try again.",
      retryAfter: payload.retryAfter || RETRY_AFTER_SECONDS,
    };
  }
  return failedUpload(errorMessage || "Upload failed");
}
