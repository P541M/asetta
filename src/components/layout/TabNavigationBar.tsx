import { BookOpen, Calendar, ChartColumn, ListChecks, Plus, type LucideIcon } from "lucide-react";
import { useTab, TabType } from "../../contexts/TabContext";
import { cn } from "../../lib/utils";

interface TabNavigationBarProps {
  className?: string;
}

const TABS: { id: TabType; label: string; icon: LucideIcon }[] = [
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "assessments", label: "Assessments", icon: ListChecks },
  { id: "grades", label: "Grades", icon: ChartColumn },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "add", label: "Add", icon: Plus },
];

/** Segmented tab control: tonal track, elevated active pill. */
const TabNavigationBar = ({ className = "" }: TabNavigationBarProps) => {
  const { activeTab, setActiveTab } = useTab();

  return (
    <div className={cn("rounded-xl bg-secondary p-1", className)} role="tablist">
      <div className="flex gap-1">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex min-h-11 flex-1 items-center justify-center rounded-lg px-2 text-sm font-medium outline-hidden transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring md:px-6",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {/* Icon over label on mobile, side by side on desktop */}
              <span className="flex flex-col items-center gap-0.5 md:flex-row md:gap-2">
                <Icon className="size-4.5 shrink-0" aria-hidden />
                <span className="truncate text-xs leading-tight md:text-sm">{label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabNavigationBar;
