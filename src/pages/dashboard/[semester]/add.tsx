import { useRouter } from "next/router";
import AddAssessmentPage from "../../../components/pages/AddAssessmentPage";

const SemesterAddAssessmentPage = () => {
  const router = useRouter();
  const { semester: semesterId } = router.query;

  return <AddAssessmentPage forceSemesterId={semesterId as string} />;
};

export default SemesterAddAssessmentPage;