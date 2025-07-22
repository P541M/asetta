import { useRouter } from "next/router";
import UnifiedDashboardPage from "../../../components/pages/UnifiedDashboardPage";

const SemesterGradesPage = () => {
  const router = useRouter();
  const { semester: semesterId } = router.query;

  return <UnifiedDashboardPage forceSemesterId={semesterId as string} />;
};

export default SemesterGradesPage;