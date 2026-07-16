import { ReactNode } from "react";

interface PanelHeaderProps {
  title: string;
  actions?: ReactNode;
}

/**
 * Shared tab-panel header: one title line, optional right-aligned actions.
 * min-h-10 + leading-10 lock the title to the same position on every tab,
 * whether or not actions exist and even when the actions cluster wraps.
 */
const PanelHeader = ({ title, actions }: PanelHeaderProps) => (
  <div className="mb-6 flex min-h-10 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <h2 className="text-xl font-semibold leading-10 tracking-tight text-foreground">{title}</h2>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export default PanelHeader;
