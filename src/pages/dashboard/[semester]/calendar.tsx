import { useRouter } from "next/router";
import CalendarPage from "../../../components/pages/CalendarPage";

const SemesterCalendarPage = () => {
  const router = useRouter();
  const { semester: semesterId } = router.query;

  return <CalendarPage forceSemesterId={semesterId as string} />;
};

export default SemesterCalendarPage;