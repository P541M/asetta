import { memo } from "react";
import { DashboardData } from "../../../types/dashboard";
import CalendarView from "../../calendar/CalendarView";
import TabError from "./TabError";

const CalendarTab = memo(function CalendarTab({ data }: { data: DashboardData }) {
  const { selectedSemester, assessments, error } = data;

  return error ? (
    <TabError message={error} />
  ) : (
    <CalendarView selectedSemester={selectedSemester} assessments={assessments} />
  );
});

export default CalendarTab;
