import { db } from "./firestore";
import { collection, doc, CollectionReference, DocumentReference } from "firebase/firestore";
import { coursePreferencesDocId } from "../utils/courseName";

export const getAssessmentsRef = (userId: string, semesterId: string): CollectionReference => {
  return collection(db, "users", userId, "semesters", semesterId, "assessments");
};

export const getAssessmentDocRef = (
  userId: string,
  semesterId: string,
  assessmentId: string,
): DocumentReference => {
  return doc(db, "users", userId, "semesters", semesterId, "assessments", assessmentId);
};

// Never the raw course name: a "/" in it would add path segments.
export const getCoursePreferencesDocRef = (
  userId: string,
  semesterId: string,
  courseName: string,
): DocumentReference => {
  return doc(
    db,
    "users",
    userId,
    "semesters",
    semesterId,
    "coursePreferences",
    coursePreferencesDocId(courseName),
  );
};
