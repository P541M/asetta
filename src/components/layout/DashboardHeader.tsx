import { useRouter } from "next/router";
import { ChevronDown, LogOut, Plus, Settings } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import { SemesterTabsProps } from "@/types/course";
import Avatar from "../ui/Avatar";
import SemesterTabs from "../assessment/SemesterTabs";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface DashboardHeaderProps {
  onLogout?: () => Promise<void>;
  semesterProps?: SemesterTabsProps;
  onAddAssessment?: () => void;
}

// One casual variant alongside the two formal ones per period. Picked by
// day-of-year so it holds steady for the day and shifts once daily — no
// per-reload flicker, no timers.
const GREETING_POOLS: Record<"morning" | "afternoon" | "evening", string[]> = {
  morning: ["Good morning", "Morning", "Mornin'"],
  afternoon: ["Good afternoon", "Afternoon", "Hey"],
  evening: ["Good evening", "Evening", "Evenin'"],
};

const getDayOfYear = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  return Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
};

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  const period = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const pool = GREETING_POOLS[period];
  return pool[getDayOfYear() % pool.length];
};

const getTodayLabel = () =>
  new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

/** The app bar: wordmark, semester context switcher, primary action, user menu. */
const DashboardHeader = ({ onLogout, semesterProps, onAddAssessment }: DashboardHeaderProps) => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const router = useRouter();

  if (!user) return null;

  const displayName = profile?.displayName || user.displayName || user.email?.split("@")[0] || "";

  return (
    <header className="bg-background">
      <div className="mx-auto flex min-h-14 max-w-7xl items-center gap-2 px-4 py-3 md:gap-3 md:px-6">
        <p className="min-w-0 shrink truncate text-xl font-semibold tracking-tight text-foreground">
          {getTimeGreeting()}
          {displayName && `, ${displayName}`}
          <span className="hidden text-sm font-normal text-muted-foreground md:inline">
            {" "}
            · {getTodayLabel()}
          </span>
        </p>
        <div className="flex-1" />
        {semesterProps && <SemesterTabs {...semesterProps} />}
        {onAddAssessment && (
          <>
            <Button
              type="button"
              size="sm"
              onClick={onAddAssessment}
              className="hidden md:inline-flex"
            >
              Add assessment
            </Button>
            <Button
              type="button"
              size="icon"
              onClick={onAddAssessment}
              aria-label="Add assessment"
              className="md:hidden"
            >
              <Plus aria-hidden />
            </Button>
          </>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 outline-hidden transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-accent"
            aria-label="User menu"
          >
            <Avatar
              size="sm"
              name={profile?.displayName || user.displayName || user.email || undefined}
            />
            <ChevronDown
              className="size-4 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180"
              aria-hidden
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              Signed in as
              <span className="mt-0.5 block truncate text-sm font-medium text-foreground">
                {user.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.push("/settings")}>
              <Settings aria-hidden />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onLogout?.()}>
              <LogOut aria-hidden />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
