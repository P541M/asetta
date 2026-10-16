import { isValidDocId } from "./validation";

/** The longest course name a rename or an upload keeps. */
export const MAX_COURSE_NAME_LENGTH = 100;

// Marks an escaped ID. A raw ID never starts with it, so the two can't collide (A13).
const ESCAPED = "%";

/**
 * The coursePreferences doc ID for a course name. A name Firestore takes as one ID is its own ID,
 * as it has always been, so existing docs keep theirs. Any other name ("MATH/STAT 2050", ".",
 * "__x__"), and any name starting with "%", becomes "%" plus the name with "%" written as "%25"
 * and "/" as "%2F".
 */
export const coursePreferencesDocId = (courseName: string): string =>
  isValidDocId(courseName) && !courseName.startsWith(ESCAPED)
    ? courseName
    : ESCAPED + courseName.replace(/[%/]/g, (char) => (char === "%" ? "%25" : "%2F"));

/**
 * The course name a coursePreferences doc ID was made from, or null for an ID
 * `coursePreferencesDocId` never makes (a doc saved before A13 for a name starting with "%"), so
 * such a doc can't be read as another course's.
 */
export const courseNameFromPreferencesDocId = (docId: string): string | null => {
  if (!docId.startsWith(ESCAPED)) return docId;
  const name = docId
    .slice(1)
    .replace(/%(25|2F)/g, (_, code: string) => (code === "25" ? "%" : "/"));
  return coursePreferencesDocId(name) === docId ? name : null;
};

/** Why a course can't be renamed to `name`, or null when it can. Any character is allowed. */
export const validateCourseName = (name: string): string | null => {
  if (!name || name.trim().length === 0) {
    return "Course name cannot be empty";
  }
  if (name.trim().length > MAX_COURSE_NAME_LENGTH) {
    return `Course name must be ${MAX_COURSE_NAME_LENGTH} characters or less`;
  }
  return null;
};
