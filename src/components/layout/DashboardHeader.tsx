import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import Avatar from "../ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  getPersonalizedGreeting,
  getMillisecondsToNextGreetingUpdate,
  getRotatingSubtitle,
} from "../../utils/greetingUtils";

interface DashboardHeaderProps {
  onLogout?: () => Promise<void>;
}

const DashboardHeader = ({ onLogout }: DashboardHeaderProps) => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [greeting, setGreeting] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const greetingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(getPersonalizedGreeting(user, profile));
      setSubtitle(getRotatingSubtitle());
    };

    updateGreeting();

    const scheduleNextUpdate = () => {
      greetingTimeoutRef.current = setTimeout(() => {
        updateGreeting();
        scheduleNextUpdate();
      }, getMillisecondsToNextGreetingUpdate());
    };

    scheduleNextUpdate();

    return () => {
      if (greetingTimeoutRef.current) {
        clearTimeout(greetingTimeoutRef.current);
      }
    };
  }, [user, profile]);

  if (!user) return null;

  return (
    <header className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
        <div className="flex min-h-16 items-center justify-between gap-4">
          {/* Personalized greeting */}
          <div>
            <h1
              className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
              role="banner"
              aria-label={`Dashboard greeting: ${greeting}`}
            >
              {greeting}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground outline-hidden transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-accent"
              aria-label="User menu"
            >
              <Avatar
                size="sm"
                name={profile?.displayName || user.displayName || user.email || undefined}
              />
              <span className="hidden max-w-37.5 truncate md:block">
                {user?.displayName || user?.email}
              </span>
              <ChevronDown
                className="size-4 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180"
                aria-hidden
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                Signed in as
                <span className="mt-0.5 block truncate text-sm font-medium text-foreground">
                  {user?.email}
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
      </div>
    </header>
  );
};

export default DashboardHeader;
