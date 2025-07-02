import { useRouter } from "next/router";
import GradesPage from "../../../components/pages/GradesPage";

const SemesterGradesPage = () => {
  const router = useRouter();
  const { semester: semesterId } = router.query;

  return <GradesPage forceSemesterId={semesterId as string} />;
};

export default SemesterGradesPage;