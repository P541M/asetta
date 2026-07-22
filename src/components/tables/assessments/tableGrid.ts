import { cn } from "@/lib/utils";

/**
 * Single source of truth for the desktop table tracks so the header, read rows,
 * and edit rows stay column-aligned: checkbox · status · course · task · due ·
 * (weight) · actions. The fixed tracks are sized to their controls (16px
 * checkbox, 144px status chip, date+time edit inputs in the due track, three
 * 32px icon buttons in the actions track).
 */
export const assessmentGridClass = (showWeight: boolean) =>
  cn(
    "hidden lg:grid lg:items-center lg:gap-x-3",
    showWeight
      ? "lg:grid-cols-[1rem_9rem_minmax(0,1fr)_minmax(0,1.6fr)_14rem_4.5rem_6.25rem]"
      : "lg:grid-cols-[1rem_9rem_minmax(0,1fr)_minmax(0,1.6fr)_14rem_6.25rem]",
  );
