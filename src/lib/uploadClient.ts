import { User } from "firebase/auth";

/**
 * POSTs syllabus files to /api/upload with the user's Firebase ID token.
 * Callers own response parsing/error handling (the two upload forms have
 * intentionally different success and error flows).
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
