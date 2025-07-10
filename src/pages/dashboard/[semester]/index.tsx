import { useRouter } from "next/router";
import { useEffect } from "react";

const SemesterDashboard = () => {
  const router = useRouter();
  const { semester: semesterId } = router.query;

  useEffect(() => {
    // Redirect to assessments page as the default semester landing
    if (semesterId && typeof semesterId === "string") {
      router.replace(`/dashboard/${semesterId}/assessments`);
    }
  }, [router, semesterId]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg-primary">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-light-text-tertiary dark:border-dark-text-tertiary"></div>
        <p className="mt-4 text-gray-600 dark:text-dark-text-secondary">
          Redirecting...
        </p>
      </div>
    </div>
  );
};

export default SemesterDashboard;