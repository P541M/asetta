import type { Assessment } from "@/types/assessment";

/** A valid assessment; each test overrides only the fields it is about. */
export const makeAssessment = (overrides: Partial<Assessment> = {}): Assessment => ({
  id: "a1",
  courseName: "CIS 3760",
  assignmentName: "Assignment 1",
  dueDate: "2026-10-15",
  dueTime: "23:59",
  weight: 10,
  status: "Not started",
  mark: null,
  ...overrides,
});
