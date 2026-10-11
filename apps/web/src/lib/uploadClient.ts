import { User } from "firebase/auth";
import { ExtractionResult } from "../types/upload";
import { formatBytes, MAX_TOTAL_UPLOAD_BYTES } from "./upload/constants";

/**
 * POSTs syllabus files to /api/upload with the user's Firebase ID token.
 * Callers own response parsing/error handling (the two upload forms have
 * intentionally different success and error flows), but should parse via
 * `parseUploadResponse` so platform-level HTML errors stay readable.
 */
export async function postUploadForm(user: User, formData: FormData): Promise<Response> {
  const token = await user.getIdToken();
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
  quotaType?: string;
  data?: ExtractionResult;
  errors?: string[];
  hasRateLimitErrors?: boolean;
}

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
 * request never reached the handler — or the handler was killed mid-flight.
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
