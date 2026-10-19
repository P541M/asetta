import { memo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTab } from "../../../contexts/TabContext";
import { DashboardData } from "../../../types/dashboard";
import CourseFilteredAssessments from "../../assessment/CourseFilteredAssessments";
import AssessmentsTable from "../../tables/AssessmentsTable";
import TabError from "./TabError";

const AssessmentsTab = memo(function AssessmentsTab({ data }: { data: DashboardData }) {
  const router = useRouter();
  const { setActiveTab } = useTab();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const { selectedSemesterId, assessments, error, courseColors } = data;

  useEffect(() => {
    if (router.query.course && typeof router.query.course === "string") {
      setSelectedCourse(decodeURIComponent(router.query.course));
    } else {
      setSelectedCourse(null);
    }
  }, [router.query.course]);

  const handleClearCourseSelection = () => {
    setSelectedCourse(null);
    const newQuery = { ...router.query };
    delete newQuery.course;
    // Switch back to courses tab when clearing course selection
    newQuery.tab = "courses";
    router.replace({ pathname: router.pathname, query: newQuery }, undefined, {
      shallow: true,
    });
    setActiveTab("courses");
  };

  return (
    <div>
      {selectedCourse ? (
        <CourseFilteredAssessments
          assessments={assessments}
          error={error}
          semesterId={selectedSemesterId}
          selectedCourse={selectedCourse}
          onBack={handleClearCourseSelection}
          courseColors={courseColors}
        />
      ) : (
        <>
          {error ? (
            <TabError message={error} />
          ) : (
            <AssessmentsTable
              assessments={assessments}
              semesterId={selectedSemesterId}
              courseColors={courseColors}
            />
          )}
        </>
      )}
    </div>
  );
});

export default AssessmentsTab;
