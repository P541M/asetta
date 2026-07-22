import { BookOpen, Calendar, ChartColumn, ListChecks, type LucideIcon } from "lucide-react";
import { useTab, TabType } from "../../contexts/TabContext";
import { cn } from "../../lib/utils";

const TABS: { id: TabType; label: string; icon: LucideIcon }[] = [
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "assessments", label: "Assessments", icon: ListChecks },
  { id: "grades", label: "Grades", icon: ChartColumn },
  { id: "calendar", label: "Calendar", icon: Calendar },
];

/**
 * Both navigations for the four destination tabs: text-only underline tabs on
 * md+, a fixed bottom bar (icons as navigation aids) below md. "Add" is not a
 * tab — it is the chrome's primary action.
 */
const TabNavigationBar = () => {
  const { activeTab, setActiveTab } = useTab();

  return (
    <>
      {/* Desktop: underline tabs */}
      <div className="hidden gap-6 md:flex" role="tablist">
        {TABS.map(({ id, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(id)}
              className={cn(
                "min-h-11 border-b-2 px-0.5 text-sm outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "border-primary font-semibold text-foreground"
                  : "border-transparent font-medium text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Mobile: fixed bottom navigation (below the overlay recipe's z-150) */}
      <nav
        className="pb-safe fixed inset-x-0 bottom-0 z-40 bg-card shadow-soft md:hidden"
        role="tablist"
        aria-label="Primary"
      >
        <div className="flex">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden />
                <span className="text-xs font-medium leading-none">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default TabNavigationBar;
