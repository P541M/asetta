import { useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic, { type DynamicOptionsLoadingProps } from "next/dynamic";
import { TabProvider, useTab, TabType } from "../../contexts/TabContext";
import DashboardLayout from "../layout/DashboardLayout";
import ChunkLoading from "../ui/ChunkLoading";

interface UnifiedDashboardPageProps {
  forceSemesterId?: string;
}

/* Each tab is its own chunk, so a dashboard page loads only the chrome up front. The open
   tab's chunk is fetched at mount, while auth and the Firestore reads are still loading, so it is
   normally there before the data is. */
const TAB_LOADERS = {
  courses: () => import("./dashboard-tabs/CoursesTab"),
  assessments: () => import("./dashboard-tabs/AssessmentsTab"),
  grades: () => import("./dashboard-tabs/GradesTab"),
  calendar: () => import("./dashboard-tabs/CalendarTab"),
  add: () => import("./dashboard-tabs/AddTab"),
} satisfies Record<TabType, () => Promise<unknown>>;

const TabLoading = (props: DynamicOptionsLoadingProps) => <ChunkLoading {...props} part="tab" />;

// The tabs render only after the client has the user's data, never on the server. (next/dynamic
// needs its options as a literal in each call.)
const CoursesTab = dynamic(TAB_LOADERS.courses, { ssr: false, loading: TabLoading });
const AssessmentsTab = dynamic(TAB_LOADERS.assessments, { ssr: false, loading: TabLoading });
const GradesTab = dynamic(TAB_LOADERS.grades, { ssr: false, loading: TabLoading });
const CalendarTab = dynamic(TAB_LOADERS.calendar, { ssr: false, loading: TabLoading });
const AddTab = dynamic(TAB_LOADERS.add, { ssr: false, loading: TabLoading });

const DashboardContent = ({ urlSemesterId }: { urlSemesterId?: string }) => {
  const router = useRouter();
  const { activeTab } = useTab();

  useEffect(() => {
    // A failed fetch is retried, and shown, by the tab's own load
    TAB_LOADERS[activeTab]().catch(() => {});
  }, [activeTab]);

  const handleSelectCourse = useCallback(
    (courseName: string) => {
      const newQuery = {
        ...router.query,
        tab: "assessments",
        course: encodeURIComponent(courseName),
      };
      router.replace({ pathname: router.pathname, query: newQuery }, undefined, {
        shallow: true,
      });
    },
    [router],
  );

  return (
    <DashboardLayout
      title="Dashboard | Asetta"
      description="Manage your semesters, track assessments, and stay organized with Asetta."
      forceSemesterId={urlSemesterId}
    >
      {(data) => (
        /* The five tab panels stay mounted (display-toggled) so their state survives switching
           and a tab opens with its data already loaded; memo keeps the hidden ones from
           re-rendering on every interaction. Rendering the hidden ones is what fetches their
           chunks, once the data is in. */
        <div>
          <div style={{ display: activeTab === "courses" ? "block" : "none" }}>
            <CoursesTab data={data} onSelectCourse={handleSelectCourse} />
          </div>

          <div style={{ display: activeTab === "assessments" ? "block" : "none" }}>
            <AssessmentsTab data={data} />
          </div>

          <div style={{ display: activeTab === "grades" ? "block" : "none" }}>
            <GradesTab data={data} urlSemesterId={urlSemesterId} />
          </div>

          <div style={{ display: activeTab === "calendar" ? "block" : "none" }}>
            <CalendarTab data={data} />
          </div>

          <div style={{ display: activeTab === "add" ? "block" : "none" }}>
            <AddTab data={data} urlSemesterId={urlSemesterId} />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

const UnifiedDashboardPage = ({ forceSemesterId }: UnifiedDashboardPageProps) => {
  const router = useRouter();
  const urlSemesterId = forceSemesterId || (router.query.semester as string);

  const getInitialTab = (): TabType => {
    if (router.query.tab && typeof router.query.tab === "string") {
      const tab = router.query.tab as TabType;
      if (["courses", "assessments", "grades", "calendar", "add"].includes(tab)) {
        return tab;
      }
    }

    if (router.pathname.includes("/courses")) return "courses";
    if (router.pathname.includes("/assessments")) return "assessments";
    if (router.pathname.includes("/grades")) return "grades";
    if (router.pathname.includes("/calendar")) return "calendar";
    if (router.pathname.includes("/add")) return "add";

    return "assessments";
  };

  return (
    <TabProvider initialTab={getInitialTab()}>
      <DashboardContent urlSemesterId={urlSemesterId} />
    </TabProvider>
  );
};

export default UnifiedDashboardPage;
