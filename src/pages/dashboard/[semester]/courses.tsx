import { useRouter } from "next/router";
import CoursesPage from "../../../components/pages/CoursesPage";

const SemesterCoursesPage = () => {
  const router = useRouter();
  const { semester: semesterId } = router.query;

  return <CoursesPage forceSemesterId={semesterId as string} />;
};

export default SemesterCoursesPage;