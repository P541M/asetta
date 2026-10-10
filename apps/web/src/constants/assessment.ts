/**
 * Shared assessment status constants.
 *
 * "Completed" here means the assessment no longer needs work (submitted or missed);
 * it drives stats, filtering, and grade math identically across the app.
 */
const COMPLETED_STATUSES = ["Submitted", "Missed"];

export const isCompletedStatus = (status: string): boolean => COMPLETED_STATUSES.includes(status);
