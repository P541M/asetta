import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

/**
 * Asetta switch. Dependency-free (`role="switch"` button, no Radix): tonal
 * `--accent` track when off (one step deeper than list surfaces, like the
 * checkbox), primary amber when on, elevated `--card` thumb. The 44px hit
 * area comes from the padding wrapper; the visible track stays compact.
 */
const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "group inline-flex min-h-11 min-w-11 items-center justify-center outline-hidden",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors",
          "group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background",
          checked ? "bg-primary" : "bg-accent",
        )}
      >
        {/* dark: override justified — the thumb must stay light in both themes;
            dark bg-card (#1E1E1E) would disappear on the dark accent track (#333) */}
        <span
          className={cn(
            "inline-block size-5 rounded-full bg-card shadow-sm dark:bg-foreground motion-safe:transition-transform motion-safe:duration-200",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </span>
    </button>
  ),
);
Switch.displayName = "Switch";

export { Switch };
