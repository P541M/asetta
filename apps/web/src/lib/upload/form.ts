import type { NextApiRequest } from "next";
import { IncomingForm, type Fields, type File as FormidableFile, type Files } from "formidable";
import fs from "fs";
import {
  ACCEPTED_MIME_TYPE,
  MAX_FILES_PER_UPLOAD,
  MAX_FILE_BYTES,
  MAX_TOTAL_UPLOAD_BYTES,
} from "./constants";

// formidable stamps its own errors with an httpCode, and every size/count
// violation is a 413. Reading httpCode avoids importing formidable's error
// constants, which are NOT reachable via `formidable.errors` once the bundler
// applies ESM interop (it resolves to the default export, which has no
// `.errors`), so that lookup throws at module load and serves an HTML 500.
const FORMIDABLE_MAX_FILES_EXCEEDED = 1015;

// Check isTooManyFilesError first: it also carries httpCode 413.
export const isTooManyFilesError = (error: unknown): boolean =>
  (error as { code?: unknown })?.code === FORMIDABLE_MAX_FILES_EXCEEDED;

export const isPayloadTooLargeError = (error: unknown): boolean =>
  (error as { httpCode?: unknown })?.httpCode === 413;

/**
 * Parses the multipart body. formidable writes each file to the OS temp dir as it arrives; every
 * path it opens, including a partial file from a failed parse, is pushed onto `tempFiles` so the
 * handler can delete them all.
 */
export const parseForm = (
  req: NextApiRequest,
  tempFiles: string[],
): Promise<{ fields: Fields; files: Files }> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      multiples: true,
      // Must stay under Vercel's 4.5 MB request-body cap. Anything larger is
      // rejected at the edge with an HTML error page we never get to handle,
      // so the browser validates against the same constants before sending.
      maxFileSize: MAX_FILE_BYTES,
      maxTotalFileSize: MAX_TOTAL_UPLOAD_BYTES,
      maxFiles: MAX_FILES_PER_UPLOAD,
      filter: ({ mimetype }) => mimetype === ACCEPTED_MIME_TYPE,
    });
    form.on("fileBegin", (_name, file) => {
      tempFiles.push(file.filepath);
    });
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
};

/** A text field's value; formidable gives every field as an array. */
export const formField = (fields: Fields, name: string): string | undefined => {
  const value = fields[name];
  return Array.isArray(value) ? value[0] : value;
};

/** Every uploaded file, whatever field it came in. */
export const formFiles = (files: Files): FormidableFile[] =>
  Object.values(files).flatMap((file) => file ?? []);

/** Deletes formidable's temp files. A file that is already gone is fine; anything else is logged. */
export const removeTempFiles = async (paths: string[]) => {
  const results = await Promise.allSettled(paths.map((p) => fs.promises.rm(p, { force: true })));
  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Upload: could not delete a temp file", result.reason);
    }
  }
};
