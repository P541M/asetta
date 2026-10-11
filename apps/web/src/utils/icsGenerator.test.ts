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

/** DTSTAMP is UTC by spec, so the test clock is built in UTC. */
const NOW = new Date(Date.UTC(2026, 9, 11, 16, 5, 9));

const onlyEvent = (overrides: Parameters<typeof makeAssessment>[0]) =>
  eventLines(generateICSFile([makeAssessment(overrides)], "Fall 2026", NOW))[0];

/** The calendar with folded lines joined back (RFC 5545 unfolding). */
const unfold = (ics: string) => ics.replaceAll("\r\n ", "");

describe("generateICSFile", () => {
  it("wraps the events in a calendar named after the semester", () => {
    const ics = generateICSFile([], "Fall 2026", NOW);
    expect(ics.split("\r\n")).toEqual([
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Asetta//Fall 2026 Calendar//EN",
      "CALSCALE:GREGORIAN",
      "END:VCALENDAR",
    ]);
  });

  it("separates lines with CRLF only", () => {
    const ics = generateICSFile([makeAssessment()], "Fall 2026", NOW);
    expect(ics.replaceAll("\r\n", "")).not.toMatch(/[\r\n]/);
  });

  it("writes one event per assessment", () => {
    const ics = generateICSFile(
      [makeAssessment({ id: "a1" }), makeAssessment({ id: "a2" })],
      "Fall 2026",
      NOW,
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
    const ics = generateICSFile([makeAssessment()], "Fall 2026", NOW);
    expect(ics).toContain("BEGIN:VALARM\r\nTRIGGER:-PT1H\r\nACTION:DISPLAY\r\n");
  });

  it("A14: ends a 23:59 event no earlier than it starts", () => {
    const lines = onlyEvent({ dueDate: "2026-10-15", dueTime: "23:59" });
    const start = field(lines, "DTSTART")!;
    const end = field(lines, "DTEND") ?? start;
    expect(stampValue(end)).toBeGreaterThanOrEqual(stampValue(start));
  });

  it("A14: stamps every event with DTSTAMP (RFC 5545)", () => {
    expect(field(onlyEvent({}), "DTSTAMP")).toBeDefined();
  });

  it("A14: escapes commas, semicolons and backslashes in SUMMARY", () => {
    const lines = onlyEvent({ courseName: "Math, Stats; Intro\\Labs", assignmentName: "Quiz 1" });
    expect(field(lines, "SUMMARY")).toBe(String.raw`Math\, Stats\; Intro\\Labs: Quiz 1`);
  });

  it("A14: folds lines longer than 75 octets", () => {
    const ics = generateICSFile(
      [makeAssessment({ assignmentName: "x".repeat(120) })],
      "Fall 2026",
      NOW,
    );
    const encoder = new TextEncoder();
    for (const line of ics.split("\r\n")) {
      expect(encoder.encode(line).length).toBeLessThanOrEqual(75);
    }
  });

  it("A14: ends a 23:59 event at 00:59 the next day", () => {
    const lines = onlyEvent({ dueDate: "2026-10-15", dueTime: "23:59" });
    expect(field(lines, "DTEND")).toBe("20261016T005900");
  });

  it("A14: rolls a late end over into the next year", () => {
    const lines = onlyEvent({ dueDate: "2026-12-31", dueTime: "23:30" });
    expect(field(lines, "DTEND")).toBe("20270101T003000");
  });

  it.each([
    ["2026-03-08", "02:30", "20260308T023000", "20260308T033000"],
    ["2026-11-01", "01:30", "20261101T013000", "20261101T023000"],
  ])("keeps %s %s as wall-clock time on a DST weekend", (dueDate, dueTime, start, end) => {
    const lines = onlyEvent({ dueDate, dueTime });
    expect(field(lines, "DTSTART")).toBe(start);
    expect(field(lines, "DTEND")).toBe(end);
  });

  it("pads an unpadded due time", () => {
    const lines = onlyEvent({ dueDate: "2026-10-15", dueTime: "9:05" });
    expect(field(lines, "DTSTART")).toBe("20261015T090500");
    expect(field(lines, "DTEND")).toBe("20261015T100500");
  });

  it("A14: stamps DTSTAMP in UTC from the moment the file is made", () => {
    expect(field(onlyEvent({}), "DTSTAMP")).toBe("20261011T160509Z");
  });

  it("A14: escapes newlines in SUMMARY", () => {
    const lines = onlyEvent({ assignmentName: "Lab 2\nPart B" });
    expect(field(lines, "SUMMARY")).toBe(String.raw`CIS 3760: Lab 2\nPart B`);
  });

  it("A14: escapes the semester name in PRODID", () => {
    const ics = generateICSFile([], "Fall, 2026; Year 2", NOW);
    expect(ics).toContain(String.raw`PRODID:-//Asetta//Fall\, 2026\; Year 2 Calendar//EN`);
  });

  it("A14: unfolds back to the original line", () => {
    const ics = generateICSFile(
      [makeAssessment({ assignmentName: "x".repeat(120) })],
      "Fall 2026",
      NOW,
    );
    expect(field(eventLines(unfold(ics))[0], "SUMMARY")).toBe(`CIS 3760: ${"x".repeat(120)}`);
  });

  it("A14: counts octets, not characters, and never splits a character when folding", () => {
    const name = `${"é".repeat(40)}${"🎓".repeat(12)}`;
    const ics = generateICSFile([makeAssessment({ assignmentName: name })], "Fall 2026", NOW);
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    for (const line of ics.split("\r\n")) {
      expect(encoder.encode(line).length).toBeLessThanOrEqual(75);
      // A split surrogate pair would come back as U+FFFD
      expect(decoder.decode(encoder.encode(line))).toBe(line);
    }
    expect(field(eventLines(unfold(ics))[0], "SUMMARY")).toBe(`CIS 3760: ${name}`);
  });

  it("A14 (D9): keeps the UID on asetta.app, so a re-import updates events instead of duplicating them", () => {
    expect(field(onlyEvent({ id: "abc123" }), "UID")).toBe("abc123@asetta.app");
  });
});
