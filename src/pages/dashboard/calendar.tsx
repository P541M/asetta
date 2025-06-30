import DashboardLayout from "../../components/layout/DashboardLayout";
import CalendarView from "../../components/calendar/CalendarView";

const CalendarPage = () => {
  return (
    <DashboardLayout
      title="Calendar - Asetta"
      description="View your assessments in a calendar format to better manage deadlines."
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