import { describe, expect, it } from "vitest";
import { reminderEmail, type ReminderDetails } from "./emailTemplates";

const details = (overrides: Partial<ReminderDetails> = {}): ReminderDetails => ({
  assessmentTitle: "Lab report 2",
  courseName: "CHEM 1010",
  dueDate: "2026-10-15",
  dueTime: "23:59",
  daysUntilDue: 1,
  ...overrides,
});

describe("reminderEmail", () => {
  // The cron passes the stored date and time, already in the student's zone, and the day count it
  // computed there (A8); the email shows them as they are, whatever zone the server runs in.
  it("shows the stored due date and time as written", () => {
    const { html, text } = reminderEmail(details(), "https://asetta.me");
    expect(text).toContain("Thursday, October 15 at 11:59 PM");
    expect(html).toContain("Thursday, October 15 at 11:59");
  });

  it("formats a morning time and a date right after midnight", () => {
    expect(reminderEmail(details({ dueTime: "09:05" })).text).toContain("at 9:05 AM");
    expect(reminderEmail(details({ dueDate: "2026-11-01", dueTime: "00:30" })).text).toContain(
      "Sunday, November 1 at 12:30 AM",
    );
  });

  it.each([
    [0, "today"],
    [1, "tomorrow"],
    [3, "in 3 days"],
  ])("says %i days as %j in the subject and the heading", (daysUntilDue, words) => {
    const { subject, text } = reminderEmail(details({ daysUntilDue }));
    expect(subject).toContain(`due ${words}`);
    expect(text).toContain(`Due ${words}`);
  });

  it("escapes the stored names in the HTML", () => {
    const { html } = reminderEmail(details({ assessmentTitle: "<b>Quiz</b>" }));
    expect(html).toContain("&lt;b&gt;Quiz&lt;/b&gt;");
    expect(html).not.toContain("<b>Quiz</b>");
  });
});
