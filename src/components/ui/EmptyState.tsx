import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** A lucide icon, sized by the caller (convention: `size-12`). */
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

/** Centered empty-state block for tabs and panels. */
const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => (
  <div className={cn("px-6 py-16 text-center", className)}>
    <div className="mx-auto mb-4 flex justify-center text-muted-foreground/50">{icon}</div>
    <h3 className="mb-2 text-base font-semibold text-foreground">{title}</h3>
    <p className="mx-auto max-w-md text-sm text-muted-foreground">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;
