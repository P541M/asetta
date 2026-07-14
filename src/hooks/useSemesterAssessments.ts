import { useEffect, useRef, useState } from "react";
import { User } from "firebase/auth";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Assessment } from "../types/assessment";
import { CourseStats } from "../types/course";
import { isCompletedStatus } from "../constants/assessment";

export interface DashboardStats {
  total: number;
  notStarted: number;
  inProgress: number;
  submitted: number;
  upcomingDeadlines: number;
  completionRate: number;
}

const EMPTY_STATS: DashboardStats = {
  total: 0,
  notStarted: 0,
  inProgress: 0,
  submitted: 0,
  upcomingDeadlines: 0,
  completionRate: 0,
};

// Helper function to process course statistics from assessments
function processCourseStats(assessmentsList: Assessment[]): CourseStats[] {
  const courseMap = new Map<string, Assessment[]>();
  assessmentsList.forEach((assessment) => {
    if (!courseMap.has(assessment.courseName)) {
      courseMap.set(assessment.courseName, []);
    }
    courseMap.get(assessment.courseName)?.push(assessment);
  });

  const courseStatsList: CourseStats[] = [];
  courseMap.forEach((assessments, courseName) => {
    const completed = assessments.filter((a) => isCompletedStatus(a.status));
    const now = new Date();
    const upcomingAssessments = assessments
      .filter((a) => !isCompletedStatus(a.status) && new Date(a.dueDate) >= now)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const nextUpcoming = upcomingAssessments[0];
    const progress =
      assessments.length > 0 ? Math.round((completed.length / assessments.length) * 100) : 0;

    courseStatsList.push({
      courseName,
      totalAssessments: assessments.length,
      pendingAssessments: assessments.length - completed.length,
      completedAssessments: completed.length,
      nextDueDate: nextUpcoming ? nextUpcoming.dueDate : null,
      nextAssignment: nextUpcoming ? nextUpcoming.assignmentName : null,
      progress,
    });
  });

  return courseStatsList.sort((a, b) => a.courseName.localeCompare(b.courseName));
}

function computeStats(assessmentsList: Assessment[]): DashboardStats {
  const now = new Date();
  const oneWeek = new Date();
  oneWeek.setDate(now.getDate() + 7);
  const totalCount = assessmentsList.length;
  const notStartedCount = assessmentsList.filter((a) => a.status === "Not started").length;
  const inProgressCount = assessmentsList.filter((a) => a.status === "In progress").length;
  const completedCount = assessmentsList.filter((a) => isCompletedStatus(a.status)).length;
  const upcomingCount = assessmentsList.filter((a) => {
    const dueDate = new Date(a.dueDate);
    return dueDate > now && dueDate <= oneWeek && !isCompletedStatus(a.status);
  }).length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  return {
    total: totalCount,
    notStarted: notStartedCount,
    inProgress: inProgressCount,
    submitted: completedCount,
    upcomingDeadlines: upcomingCount,
    completionRate: completionRate,
  };
}

/**
 * Live assessments for the selected semester (Firestore onSnapshot), plus the
 * derived course list and dashboard stats.
 *
 * The subscription is keyed on user + semester only. Whether the loading spinner
 * shows is tracked via a ref so that data arriving/changing does not tear down
 * and recreate the listener (previously this effect also depended on
 * `assessments.length`, causing a needless re-subscribe on every add/delete).
 */
export function useSemesterAssessments(user: User | null, selectedSemesterId: string) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [courses, setCourses] = useState<CourseStats[]>([]);
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const hasDataRef = useRef(false);

  useEffect(() => {
    if (!user || !selectedSemesterId) {
      setAssessments([]);
      hasDataRef.current = false;
      return;
    }

    // Only show loading spinner on initial load or when there's no previous data
    if (!hasDataRef.current) {
      setIsLoading(true);
    }
    setIsDataReady(false);
    setError(null);
    const assessmentsRef = collection(
      db,
      "users",
      user.uid,
      "semesters",
      selectedSemesterId,
      "assessments",
    );
    const q = query(assessmentsRef, orderBy("dueDate", "asc"));
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const assessmentsList: Assessment[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            const today = new Date().toISOString().split("T")[0];
            return {
              id: doc.id,
              title: data.assignmentName || "Unknown Assessment",
              dueDate: data.dueDate || today,
              status: data.status || "Not started",
              notes: data.notes || "",
              courseName: data.courseName || "Unknown Course",
              assignmentName: data.assignmentName || "Unknown Assessment",
              dueTime: data.dueTime || "23:59",
              weight: data.weight || 0,
            };
          });
          hasDataRef.current = assessmentsList.length > 0;
          setAssessments(assessmentsList);

          // Process course statistics
          setCourses(processCourseStats(assessmentsList));

          // Extract available courses (sorted alphabetically)
          const uniqueCourses = Array.from(
            new Set(assessmentsList.map((a) => a.courseName)),
          ).sort();
          setAvailableCourses(uniqueCourses);

          setStats(computeStats(assessmentsList));
          setIsLoading(false);

          // Add a small delay before marking data as ready to ensure smooth animations
          setTimeout(() => {
            setIsDataReady(true);
          }, 50);
        },
        (err) => {
          console.error("Error fetching assessments:", err);
          setError("Failed to load assessments. Please try again.");
          setIsLoading(false);
          setIsDataReady(true);
        },
      );
    } catch (error) {
      console.error("Error setting up assessments listener:", error);
      setError("Failed to set up assessments listener. Please try again.");
      setIsLoading(false);
      setIsDataReady(true);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedSemesterId, user]);

  return { assessments, courses, availableCourses, isLoading, isDataReady, error, stats };
}
