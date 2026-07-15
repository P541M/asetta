import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Asetta text input — filled and borderless (the landing input recipe):
 * tonal resting fill (`--input`), focus lifts to an elevated surface with the
 * amber ring. 44px height for mobile touch targets (standards.md).
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-lg bg-input px-4 py-2 text-base text-foreground outline-hidden",
        "transition-[background-color,box-shadow] duration-200",
        "placeholder:text-muted-foreground/70",
        // Focus lifts to white in light mode; in dark the fill is already the
        // brighter surface, so only the ring changes (bg-card would darken it)
        "focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-ring dark:focus-visible:bg-input",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
