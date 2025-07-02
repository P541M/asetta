import { useRouter } from "next/router";
import DashboardLayout from "../layout/DashboardLayout";
import CalendarView from "../calendar/CalendarView";

interface CalendarPageProps {
  forceSemesterId?: string;
}

const CalendarPage = ({ forceSemesterId }: CalendarPageProps) => {
  const router = useRouter();
  
  // Extract semester ID from URL if this is a semester-specific route
  const urlSemesterId = forceSemesterId || (router.query.semester as string);

  return (
    <DashboardLayout
      title="Calendar - Asetta"
      description="View your assessments in a calendar format to better manage deadlines."
      forceSemesterId={urlSemesterId}
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

export default CalendarPage;