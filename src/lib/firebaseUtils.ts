import { db } from './firebase';
import { collection, doc, CollectionReference, DocumentReference } from 'firebase/firestore';

/**
 * Firebase utility functions to reduce code duplication and provide consistent document references
 */

// User document references
export const getUserDocRef = (userId: string): DocumentReference => {
  return doc(db, 'users', userId);
};

export const getUserSemestersRef = (userId: string): CollectionReference => {
  return collection(db, 'users', userId, 'semesters');
};

export const getSemesterDocRef = (userId: string, semesterId: string): DocumentReference => {
  return doc(db, 'users', userId, 'semesters', semesterId);
};

// Assessment document references
export const getAssessmentsRef = (userId: string, semesterId: string): CollectionReference => {
  return collection(db, 'users', userId, 'semesters', semesterId, 'assessments');
};

export const getAssessmentDocRef = (
  userId: string, 
  semesterId: string, 
  assessmentId: string
): DocumentReference => {
  return doc(db, 'users', userId, 'semesters', semesterId, 'assessments', assessmentId);
};

// Course document references  
export const getCoursesRef = (userId: string, semesterId: string): CollectionReference => {
  return collection(db, 'users', userId, 'semesters', semesterId, 'courses');
};

export const getCourseDocRef = (
  userId: string, 
  semesterId: string, 
  courseId: string
): DocumentReference => {
  return doc(db, 'users', userId, 'semesters', semesterId, 'courses', courseId);
};