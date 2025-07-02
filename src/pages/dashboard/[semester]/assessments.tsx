import { useRouter } from "next/router";
import AssessmentsPage from "../../../components/pages/AssessmentsPage";

const SemesterAssessmentsPage = () => {
  const router = useRouter();
  const { semester: semesterId } = router.query;

  return <AssessmentsPage forceSemesterId={semesterId as string} />;
};

export default SemesterAssessmentsPage;