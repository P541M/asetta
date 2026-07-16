import { Bell, Settings2, UserRound, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type TabType = "profile" | "preferences" | "notifications";

interface SettingsNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const TABS: { id: TabType; label: string; icon: LucideIcon }[] = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "preferences", label: "Preferences", icon: Settings2 },
  { id: "notifications", label: "Notifications", icon: Bell },
];

/** Settings tab bar: tonal track, amber-tint active pill (dashboard tab-bar recipe). */
const SettingsNavigation = ({ activeTab, setActiveTab }: SettingsNavigationProps) => (
  <div className="rounded-xl bg-secondary p-1" role="tablist">
    <div className="flex gap-1">
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex min-h-11 flex-1 items-center justify-center rounded-lg px-2 font-medium outline-hidden transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring md:px-6",
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

export default SettingsNavigation;
