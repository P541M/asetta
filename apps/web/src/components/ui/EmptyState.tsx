import { ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

/** The one empty-state recipe: small icon in a tonal circle, title, one sentence, optional action. */
const EmptyState = ({ icon: Icon, title, description, action, className }: EmptyStateProps) => (
  <div className={cn("px-6 py-12 text-center", className)}>
    <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-full bg-secondary">
      <Icon className="size-5 text-muted-foreground" aria-hidden />
    </div>
    <h3 className="mb-2 text-base font-semibold text-foreground">{title}</h3>
    <p className="mx-auto max-w-md text-sm text-muted-foreground">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;
