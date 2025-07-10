import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/router";
import { db } from "../lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const redirectToFirstSemester = async () => {
      if (!loading && !user) {
        router.push("/login");
        return;
      }

      if (!loading && user && !redirecting) {
        setRedirecting(true);
        try {
          // Get the user's first semester
          const semestersRef = collection(db, "users", user.uid, "semesters");
          const q = query(semestersRef, orderBy("order", "asc"), limit(1));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const firstSemester = querySnapshot.docs[0];
            router.push(`/dashboard/${firstSemester.id}/assessments`);
          } else {
            // No semesters found, redirect to assessments page to create one
            router.push("/dashboard/assessments");
          }
        } catch (error) {
          console.error("Error fetching first semester:", error);
          // Fallback to assessments page
          router.push("/dashboard/assessments");
        }
      }
    };

    redirectToFirstSemester();
  }, [user, loading, router, redirecting]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg-primary">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-light-button-primary border-t-transparent dark:border-dark-button-primary dark:border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-dark-text-secondary">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;