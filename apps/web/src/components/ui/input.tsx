import * as React from "react";
import { cn } from "@/lib/utils";

// Chromium opens the date and time pickers only from the small icon at the field's end; a click
// on the text edits a segment and shows no picker, so open it from a click anywhere in the field.
const PICKER_TYPES = new Set(["date", "time"]);

function openPicker(input: HTMLInputElement) {
  try {
    input.showPicker();
  } catch {
    // Throws in a cross-origin iframe and on a read-only field; older browsers lack showPicker,
    // and those fields still open from their icon.
  }
}

/**
 * Asetta text input: filled and borderless (the landing input recipe):
 * tonal resting fill (`--input`), focus lifts to an elevated surface with the
 * amber ring. 44px height for mobile touch targets (standards.md).
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onClick, ...props }, ref) => (
    <input
      type={type}
      onClick={(event) => {
        onClick?.(event);
        if (type && PICKER_TYPES.has(type) && !event.defaultPrevented) {
          openPicker(event.currentTarget);
        }
      }}
      className={cn(
        "flex h-11 w-full rounded-lg bg-input px-4 py-2 text-base text-foreground outline-hidden",
        "transition-[background-color,box-shadow] duration-150",
        "placeholder:text-muted-foreground/70",
        // Native number spinners never match the filled-input language
        "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        "[&[type=number]]:[-moz-appearance:textfield]",
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
