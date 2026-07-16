import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { PreferencesSectionProps } from "../../types/preferences";
import { cn } from "@/lib/utils";
import { Switch } from "../ui/switch";
import { setThemeWithTransition } from "../../utils/theme";

const themeOptions: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

/** A tonal row with a heading, description, and a switch on the right. */
const ToggleRow = ({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) => (
  <div className="flex items-center justify-between gap-4 rounded-xl bg-secondary/50 p-4">
    <div className="flex-1">
      <h4 className="text-base font-semibold text-foreground">{title}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={title} />
  </div>
);

const PreferencesSection = ({
  showDaysTillDue,
  setShowDaysTillDue,
  showWeight,
  setShowWeight,
  showNotes,
  setShowNotes,
  showStatsBar,
  setShowStatsBar,
}: PreferencesSectionProps) => {
  const { theme, setTheme } = useTheme();
  // next-themes has no theme value until mounted; render the buttons always
  // (stable layout) and only apply the active tint post-hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="space-y-8">
      {/* Appearance */}
      <div>
        <div className="mb-6 border-b border-border pb-4">
          <h3 className="text-base font-semibold text-foreground">Appearance</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose how Asetta looks. System follows your device setting.
          </p>
        </div>

        <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-2">
          {themeOptions.map(({ value, label, icon: Icon }) => {
            const isActive = mounted && theme === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setThemeWithTransition(value, setTheme)}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-1.5 rounded-xl p-4 outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary/50 text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden />
                <span className="text-sm font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Data & display */}
      <div>
        <div className="mb-6 border-b border-border pb-4">
          <h3 className="text-base font-semibold text-foreground">Data & display</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Customize what information is displayed in your dashboard and tables
          </p>
        </div>

        <div className="space-y-4">
          <ToggleRow
            title="Dashboard statistics"
            description="Show statistics overview at the top of your dashboard"
            checked={showStatsBar}
            onCheckedChange={setShowStatsBar}
          />
          <ToggleRow
            title="Days until due"
            description="Show countdown of days remaining until assessment due dates"
            checked={showDaysTillDue}
            onCheckedChange={setShowDaysTillDue}
          />
          <ToggleRow
            title="Assessment weight"
            description="Display the weight/percentage column in assessments table"
            checked={showWeight}
            onCheckedChange={setShowWeight}
          />
          <ToggleRow
            title="Assessment notes"
            description="Show notes and additional information in the assessments table"
            checked={showNotes}
            onCheckedChange={setShowNotes}
          />
        </div>
      </div>
    </div>
  );
};

export default PreferencesSection;
