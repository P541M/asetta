import { memo } from "react";
import { CoursesTabProps } from "../../../types/dashboard";
import CoursesOverviewTable from "../../tables/CoursesOverviewTable";
import TabError from "./TabError";

const CoursesTab = memo(function CoursesTab({ data, onSelectCourse }: CoursesTabProps) {
  const { error, courses, selectedSemesterId, courseColors, setCourseColor } = data;

  return (
    <>
      {error ? (
        <TabError message={error} />
      ) : (
        <CoursesOverviewTable
          courses={courses}
          onSelectCourse={onSelectCourse}
          semesterId={selectedSemesterId}
          courseColors={courseColors}
          setCourseColor={setCourseColor}
        />
      )}
    </>
  );
});

export default CoursesTab;
