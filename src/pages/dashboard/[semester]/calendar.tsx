import { useRouter } from "next/router";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import CalendarView from "../../../components/calendar/CalendarView";

const SemesterCalendarPage = () => {
  const router = useRouter();
  const { semester: semesterId } = router.query;

  return (
    <DashboardLayout
      title="Calendar - Asetta"
      description="View your assessments in a calendar format for this semester."
      forceSemesterId={semesterId as string}
    >
      {({
        selectedSemester,
        selectedSemesterId,
      }) => (
        <div className="animate-fade-in">
          <CalendarView
            selectedSemester={selectedSemester}
            semesterId={selectedSemesterId}
          />
        </div>
      )}
    </DashboardLayout>
  );
};

export default SemesterCalendarPage;