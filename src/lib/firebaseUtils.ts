import { db } from "./firebase";
import { collection, doc, CollectionReference, DocumentReference } from "firebase/firestore";

/**
 * Firebase utility functions to reduce code duplication and provide consistent document references
 */

// User document references
export const getUserDocRef = (userId: string): DocumentReference => {
  return doc(db, "users", userId);
};

// Assessment document references
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

// Course preferences document references
export const getCoursePreferencesDocRef = (
  userId: string,
  semesterId: string,
  courseName: string,
): DocumentReference => {
  return doc(db, "users", userId, "semesters", semesterId, "coursePreferences", courseName);
};
