import { useRouter } from "next/router";
import UnifiedDashboardPage from "../../../components/pages/UnifiedDashboardPage";

const SemesterDashboard = () => {
  const router = useRouter();
  const { semester: semesterId } = router.query;

  return (
    <UnifiedDashboardPage 
      forceSemesterId={semesterId as string} 
    />
  );
};

export default SemesterDashboard;