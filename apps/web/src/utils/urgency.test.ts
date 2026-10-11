import { describe, expect, it } from "vitest";
import { daysUntilLabel, urgencyChipClass, urgencyTextClass } from "./urgency";

describe("daysUntilLabel", () => {
  it.each([
    [-3, "Overdue"],
    [-1, "Overdue"],
    [0, "Due today"],
    [1, "Due tomorrow"],
    [2, "2 days left"],
    [30, "30 days left"],
  ])("labels %i days as %j", (days, label) => {
    expect(daysUntilLabel(days)).toBe(label);
  });
});

describe("urgency thresholds", () => {
  it.each([
    [-1, "text-destructive", "bg-destructive/10 text-destructive"],
    [0, "text-destructive", "bg-destructive/10 text-destructive"],
    [3, "text-destructive", "bg-destructive/10 text-destructive"],
    [4, "text-primary", "bg-primary/10 text-primary"],
    [7, "text-primary", "bg-primary/10 text-primary"],
    [8, "text-muted-foreground", "bg-foreground/5 text-muted-foreground"],
  ])("tints %i days with %s", (days, textClass, chipClass) => {
    expect(urgencyTextClass(days)).toBe(textClass);
    expect(urgencyChipClass(days)).toBe(chipClass);
  });
});
