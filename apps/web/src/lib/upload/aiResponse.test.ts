import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parseAiAssessments } from "./aiResponse";

// The uploader's local today. The clock below is 23:30 that evening, when the UTC day has already
// moved on in Toronto.
const LOCAL_DATE = "2026-10-11";
const TEXT = "CIS 3760 Software Engineering\nFall 2026";

const item = {
  courseName: "CIS 3760",
  assignmentName: "Assignment 1",
  dueDate: "2026-10-15",
  dueTime: "23:59",
  weight: 10,
  status: "Not started",
};
const reply = (items: unknown) => JSON.stringify(items);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 11, 23, 30));
});
afterEach(() => {
  vi.useRealTimers();
});

describe("parseAiAssessments", () => {
  describe("reading the JSON", () => {
    it.each([
      ["a bare array", reply([item])],
      ["a ```json fence", "```json\n" + reply([item]) + "\n```"],
      ["a bare ``` fence", "```\n" + reply([item]) + "\n```"],
      ["text around the array", "Here is the JSON:\n" + reply([item]) + "\nDone."],
      ["surrounding whitespace", "\n\n  " + reply([item]) + "  \n"],
    ])("reads %s", (_label, aiContent) => {
      expect(parseAiAssessments(aiContent, TEXT, LOCAL_DATE)).toEqual([item]);
    });

    it("reads an empty array as no assessments", () => {
      expect(parseAiAssessments("[]", TEXT, LOCAL_DATE)).toEqual([]);
    });

    it("throws when the reply isn't JSON", () => {
      expect(() => parseAiAssessments("Sorry, I can't help.", TEXT, LOCAL_DATE)).toThrow(/parse/i);
    });

    it("throws when the JSON isn't an array", () => {
      expect(() => parseAiAssessments(reply(item), TEXT, LOCAL_DATE)).toThrow(/not an array/);
    });

    it("A9: finds the array after a bracket in the text before it", () => {
      const aiContent = "Found [1] assessment:\n" + reply([item]);
      expect(parseAiAssessments(aiContent, TEXT, LOCAL_DATE)).toEqual([item]);
    });
  });

  describe("filling in fields", () => {
    it("drops entries that aren't objects", () => {
      const aiContent = reply([null, "Quiz", 3, item]);
      expect(parseAiAssessments(aiContent, TEXT, LOCAL_DATE)).toEqual([item]);
    });

    it("takes a missing course name from the outline's course code", () => {
      const [assessment] = parseAiAssessments(
        reply([{ ...item, courseName: "" }]),
        TEXT,
        LOCAL_DATE,
      );
      expect(assessment.courseName).toBe("CIS3760");
    });

    it("falls back to Unknown Course when the outline has no code either", () => {
      const [assessment] = parseAiAssessments(
        reply([{ ...item, courseName: undefined }]),
        "Welcome to the class",
        LOCAL_DATE,
      );
      expect(assessment.courseName).toBe("Unknown Course");
    });

    it("numbers an assessment without a name by its place in the reply", () => {
      const aiContent = reply([item, { ...item, assignmentName: "" }]);
      expect(parseAiAssessments(aiContent, TEXT, LOCAL_DATE)[1].assignmentName).toBe(
        "Assessment 2",
      );
    });

    it("reads a weight given as text", () => {
      const aiContent = reply([
        { ...item, weight: "25%" },
        { ...item, weight: "12.5" },
        { ...item, weight: "none" },
      ]);
      expect(parseAiAssessments(aiContent, TEXT, LOCAL_DATE).map((a) => a.weight)).toEqual([
        25, 12.5, 0,
      ]);
    });

    it("always starts an assessment as Not started", () => {
      const [assessment] = parseAiAssessments(
        reply([{ ...item, status: "Submitted" }]),
        TEXT,
        LOCAL_DATE,
      );
      expect(assessment.status).toBe("Not started");
    });

    it("defaults a missing time to 23:59", () => {
      const [assessment] = parseAiAssessments(
        reply([{ ...item, dueTime: undefined }]),
        TEXT,
        LOCAL_DATE,
      );
      expect(assessment.dueTime).toBe("23:59");
    });
  });

  describe("A9: every field normalized", () => {
    it("A9: flags a missing date for review on the local day, not the UTC day", () => {
      const [assessment] = parseAiAssessments(
        reply([{ ...item, dueDate: undefined }]),
        TEXT,
        LOCAL_DATE,
      );
      expect(assessment).toMatchObject({ dueDate: LOCAL_DATE, needsReview: true });
    });

    it("A9: flags an impossible date for review", () => {
      const [assessment] = parseAiAssessments(
        reply([{ ...item, dueDate: "2026-02-30" }]),
        TEXT,
        LOCAL_DATE,
      );
      expect(assessment).toMatchObject({ dueDate: LOCAL_DATE, needsReview: true });
    });

    it("A9: turns a 12-hour time into 24-hour HH:MM", () => {
      const [assessment] = parseAiAssessments(
        reply([{ ...item, dueTime: "11:59 PM" }]),
        TEXT,
        LOCAL_DATE,
      );
      expect(assessment.dueTime).toBe("23:59");
    });

    it("A9: keeps the weight between 0 and 100", () => {
      const aiContent = reply([
        { ...item, weight: 150 },
        { ...item, weight: -5 },
      ]);
      expect(parseAiAssessments(aiContent, TEXT, LOCAL_DATE).map((a) => a.weight)).toEqual([
        100, 0,
      ]);
    });

    it("A9: trims names and ignores a course name that isn't text", () => {
      const aiContent = reply([{ ...item, courseName: 3760, assignmentName: "  Assignment\n 1 " }]);
      expect(parseAiAssessments(aiContent, TEXT, LOCAL_DATE)[0]).toMatchObject({
        courseName: "CIS3760",
        assignmentName: "Assignment 1",
      });
    });
  });
});
