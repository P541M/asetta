/**
 * Due-date urgency: one label + tint recipe shared by the assessments table and
 * the course cards, so "how urgent is this" always reads the same everywhere.
 */

export const daysUntilLabel = (days: number): string =>
  days < 0
    ? "Overdue"
    : days === 0
      ? "Due today"
      : days === 1
        ? "Due tomorrow"
        : `${days} days left`;

/** Shown instead of the urgency label while an uploaded assessment's date is a placeholder. */
export const NEEDS_REVIEW_LABEL = "Check the due date";

export const urgencyTextClass = (days: number): string =>
  days <= 3 ? "text-destructive" : days <= 7 ? "text-primary" : "text-muted-foreground";

export const urgencyChipClass = (days: number): string =>
  days <= 3
    ? "bg-destructive/10 text-destructive"
    : days <= 7
      ? "bg-primary/10 text-primary"
      : "bg-foreground/5 text-muted-foreground";
