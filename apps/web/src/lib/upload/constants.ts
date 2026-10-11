/**
 * Shared upload limits.
 *
 * Vercel caps the *entire* request body of a serverless function at 4.5 MB.
 * That cap is enforced by the platform edge, before our handler runs, and the
 * rejection comes back as an HTML error page rather than JSON — which is why an
 * oversized upload used to surface to users as
 * `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`.
 *
 * We validate against these numbers in the browser (so the request is never
 * sent) and again in the API route (so direct callers get JSON, not HTML).
 * Keep MAX_TOTAL_UPLOAD_BYTES safely under 4.5 MB to leave room for multipart
 * boundaries, field names, and header overhead.
 */
export const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB per file
export const MAX_TOTAL_UPLOAD_BYTES = 4 * 1024 * 1024; // 4 MB per request
export const MAX_FILES_PER_UPLOAD = 10;

export const ACCEPTED_MIME_TYPE = "application/pdf";

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Validates a user's file selection against the platform limits.
 * Returns a user-facing message, or null when the selection is safe to send.
 */
export const validateUploadSelection = (
  files: Array<{ name: string; size: number }>,
): string | null => {
  if (files.length === 0) return "Please select at least one PDF.";

  if (files.length > MAX_FILES_PER_UPLOAD) {
    return `You can upload up to ${MAX_FILES_PER_UPLOAD} files at once. Please remove ${
      files.length - MAX_FILES_PER_UPLOAD
    } and try again.`;
  }

  const oversized = files.find((file) => file.size > MAX_FILE_BYTES);
  if (oversized) {
    return `"${oversized.name}" is ${formatBytes(oversized.size)}. The maximum is ${formatBytes(
      MAX_FILE_BYTES,
    )} per file. Try compressing it or splitting out the pages you need.`;
  }

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
    return `Those ${files.length} files total ${formatBytes(totalBytes)}. The maximum is ${formatBytes(
      MAX_TOTAL_UPLOAD_BYTES,
    )} per upload. Please upload them in smaller batches.`;
  }

  return null;
};
