import { describe, expect, it } from "vitest";
import { makeAssessment } from "@/test/assessments";
import { generateICSFile } from "./icsGenerator";

/** Each VEVENT's own lines, stopping at its alarm (which has a DESCRIPTION of its own). */
const eventLines = (ics: string): string[][] =>
  ics
    .split("BEGIN:VEVENT\r\n")
    .slice(1)
    .map((block) => block.split("BEGIN:VALARM")[0].split("\r\n"));

const field = (lines: string[], name: string): string | undefined =>
  lines.find((line) => line.startsWith(`${name}:`))?.slice(name.length + 1);

/** "20261015T235900" as a number, so two stamps compare in order. */
const stampValue = (stamp: string) => Number(stamp.replace("T", ""));

const onlyEvent = (overrides: Parameters<typeof makeAssessment>[0]) =>
  eventLines(generateICSFile([makeAssessment(overrides)], "Fall 2026"))[0];

describe("generateICSFile", () => {
  it("wraps the events in a calendar named after the semester", () => {
    const ics = generateICSFile([], "Fall 2026");
    expect(ics.split("\r\n")).toEqual([
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Asetta//Fall 2026 Calendar//EN",
      "CALSCALE:GREGORIAN",
      "END:VCALENDAR",
    ]);
  });

  it("separates lines with CRLF only", () => {
    const ics = generateICSFile([makeAssessment()], "Fall 2026");
    expect(ics.replaceAll("\r\n", "")).not.toMatch(/[\r\n]/);
  });

  it("writes one event per assessment", () => {
    const ics = generateICSFile(
      [makeAssessment({ id: "a1" }), makeAssessment({ id: "a2" })],
      "Fall 2026",
    );
    expect(eventLines(ics)).toHaveLength(2);
  });

  it("starts at the due moment in floating local time, the same in every zone", () => {
    const lines = onlyEvent({ dueDate: "2026-10-15", dueTime: "14:30" });
    expect(field(lines, "DTSTART")).toBe("20261015T143000");
  });

  it("ends an hour after the due moment", () => {
    const lines = onlyEvent({ dueDate: "2026-10-15", dueTime: "14:30" });
    expect(field(lines, "DTEND")).toBe("20261015T153000");
  });

  it("builds the UID from the assessment id", () => {
    expect(field(onlyEvent({ id: "abc123" }), "UID")).toMatch(/^abc123@/);
  });

  it("summarizes as course and assessment", () => {
    const lines = onlyEvent({ courseName: "CIS 3760", assignmentName: "Lab 2" });
    expect(field(lines, "SUMMARY")).toBe("CIS 3760: Lab 2");
  });

  it("lists the weight and status, with the newline escaped", () => {
    const lines = onlyEvent({ weight: 15, status: "In progress" });
    expect(field(lines, "DESCRIPTION")).toBe("Weight: 15%\\nStatus: In progress");
  });

  it("adds a display alarm an hour before", () => {
    const ics = generateICSFile([makeAssessment()], "Fall 2026");
    expect(ics).toContain("BEGIN:VALARM\r\nTRIGGER:-PT1H\r\nACTION:DISPLAY\r\n");
  });

  it.fails("A14: ends a 23:59 event no earlier than it starts", () => {
    const lines = onlyEvent({ dueDate: "2026-10-15", dueTime: "23:59" });
    const start = field(lines, "DTSTART")!;
    const end = field(lines, "DTEND") ?? start;
    expect(stampValue(end)).toBeGreaterThanOrEqual(stampValue(start));
  });

  it.fails("A14: stamps every event with DTSTAMP (RFC 5545)", () => {
    expect(field(onlyEvent({}), "DTSTAMP")).toBeDefined();
  });

  it.fails("A14: escapes commas, semicolons and backslashes in SUMMARY", () => {
    const lines = onlyEvent({ courseName: "Math, Stats; Intro\\Labs", assignmentName: "Quiz 1" });
    expect(field(lines, "SUMMARY")).toBe(String.raw`Math\, Stats\; Intro\\Labs: Quiz 1`);
  });

  it.fails("A14: folds lines longer than 75 octets", () => {
    const ics = generateICSFile([makeAssessment({ assignmentName: "x".repeat(120) })], "Fall 2026");
    const encoder = new TextEncoder();
    for (const line of ics.split("\r\n")) {
      expect(encoder.encode(line).length).toBeLessThanOrEqual(75);
    }
  });

  it.todo("A14: decide whether to move the UID domain from asetta.app to asetta.me");
});
