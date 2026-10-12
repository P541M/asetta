import { CircleAlert, CloudOff, type LucideIcon } from "lucide-react";
import { UserDocError } from "@/utils/userDoc";
import { Button } from "./button";
import EmptyState from "./EmptyState";

const COPY: Record<UserDocError, { icon: LucideIcon; title: string; description: string }> = {
  offline: {
    icon: CloudOff,
    title: "Can't reach Asetta",
    description: "Check your internet connection, then try again.",
  },
  failed: {
    icon: CircleAlert,
    title: "Couldn't load your account",
    description: "Something went wrong on our side. Wait a moment, then try again.",
  },
};

/**
 * Full-screen state for a signed-in user whose account data can't be loaded, in place of a
 * page that would otherwise wait on it forever. The empty-state recipe, centered like
 * LoadingScreen.
 */
const LoadErrorScreen = ({ error }: { error: UserDocError }) => {
  const { icon, title, description } = COPY[error];
  return (
    <div role="alert" className="flex min-h-screen items-center justify-center bg-background">
      <EmptyState
        icon={icon}
        title={title}
        description={description}
        action={
          <Button type="button" onClick={() => window.location.reload()}>
            Try again
          </Button>
        }
      />
    </div>
  );
};

export default LoadErrorScreen;
