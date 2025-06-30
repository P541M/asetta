import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/router";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && user) {
      router.push("/dashboard/assessments");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg-primary">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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