import { describe, expect, it } from "vitest";
import {
  MAX_ASSESSMENT_NAME_LENGTH,
  MAX_COURSE_NAME_LENGTH,
  cleanText,
  detectDateOrder,
  normalizeExtractedAssessment,
  parseDueDate,
  parseDueTime,
  parseLocalDate,
  parseWeight,
} from "./normalize";

const LOCAL_DATE = "2026-10-11";

describe("parseDueDate", () => {
  it.each([
    ["2026-10-15", "2026-10-15"],
    ["2026/3/5", "2026-03-05"],
    ["2026-10-15T23:59:00", "2026-10-15"],
    ["October 15, 2026", "2026-10-15"],
    ["march 3 2026", "2026-03-03"],
    ["10/15/2026", "2026-10-15"],
    ["10-15-2026", "2026-10-15"],
    ["10/15/26", "2026-10-15"],
    ["05/05/2026", "2026-05-05"],
  ])("reads %j as %s", (input, expected) => {
    expect(parseDueDate(input)).toBe(expected);
  });

  for (const [input, expected] of [
    ["Sept 30, 2026", "2026-09-30"],
    ["Mar 15, 2026", "2026-03-15"],
  ]) {
    it(`A9: reads the abbreviated month in ${JSON.stringify(input)}`, () => {
      expect(parseDueDate(input)).toBe(expected);
    });
  }

  it("A9: reads 15/03/2026 as March 15, not month 15", () => {
    expect(parseDueDate("15/03/2026")).toBe("2026-03-15");
  });

  it.each([
    ["Sept. 30, 2026", "2026-09-30"],
    ["Sep 30 2026", "2026-09-30"],
    ["Fri., Oct. 16, 2026", "2026-10-16"],
    ["Friday, October 16th, 2026", "2026-10-16"],
    ["Dec. 1st, 2026", "2026-12-01"],
    ["15 March 2026", "2026-03-15"],
    ["3 Nov. 2026", "2026-11-03"],
    ["Due: Nov 20, 2026 at 11:59 PM", "2026-11-20"],
    ["Feb 29, 2028", "2028-02-29"],
    ["15.03.2026", "2026-03-15"],
    ["13/1/27", "2027-01-13"],
  ])("A9: reads the syllabus date %j as %s", (input, expected) => {
    expect(parseDueDate(input)).toBe(expected);
  });

  it.each([
    ["February 30, 2026 (not a date)", "February 30, 2026"],
    ["Feb 29 in a non-leap year", "Feb 29, 2026"],
    ["April 31", "2026-04-31"],
    ["month 15 and day 15", "15/15/2026"],
    ["month 0", "2026-00-10"],
    ["a misread page number", "6055-78-01"],
    ["a year out of range", "March 3, 1999"],
    ["a word that isn't a month", "Version 3, 2026"],
    ["words", "next Friday"],
    ["a date without a year", "Oct 15"],
    ["an empty string", ""],
    ["a number", 20261015],
    ["undefined", undefined],
  ])("A9: range-checks the result: %s gives null", (_label, input) => {
    expect(parseDueDate(input)).toBeNull();
  });

  describe("a day and month that could swap (D10)", () => {
    it("is null without the document's order, rather than a guess", () => {
      expect(parseDueDate("03/04/2026")).toBeNull();
      expect(parseDueDate("3/5/2026")).toBeNull();
    });

    it("is read in the document's order", () => {
      expect(parseDueDate("03/04/2026", "MDY")).toBe("2026-03-04");
      expect(parseDueDate("03/04/2026", "DMY")).toBe("2026-04-03");
    });

    it("ignores the order when the date settles it", () => {
      expect(parseDueDate("15/03/2026", "MDY")).toBe("2026-03-15");
      expect(parseDueDate("03/15/2026", "DMY")).toBe("2026-03-15");
    });
  });
});

describe("detectDateOrder", () => {
  it.each([
    ["DMY from a day over 12", "Quiz 1: 03/04/2026\nQuiz 2: 15/04/2026", "DMY"],
    ["MDY from a day over 12", "Quiz 1: 03/04/2026\nQuiz 2: 04/15/2026", "MDY"],
    ["undefined when every date could swap", "Quiz 1: 03/04/2026\nQuiz 2: 05/06/2026", undefined],
    ["undefined when the dates disagree", "Due 15/03/2026 and 03/15/2026", undefined],
    ["undefined without numeric dates", "Due October 15, 2026", undefined],
    ["blind to strings that aren't real dates", "Quiz 1: 03/04/2026\nSee 30/02/2026", undefined],
  ])("is %s", (_label, text, expected) => {
    expect(detectDateOrder(text)).toBe(expected);
  });
});

describe("parseDueTime", () => {
  it.each([
    ["23:59", "23:59"],
    ["9:05", "09:05"],
    ["0:00", "00:00"],
    ["11:59 PM", "23:59"],
    ["11:59pm", "23:59"],
    ["11:59 p.m.", "23:59"],
    ["11.59pm", "23:59"],
    ["9 AM", "09:00"],
    ["12:00 AM", "00:00"],
    ["12:30 PM", "12:30"],
    ["12 pm", "12:00"],
    ["  2:30 PM EST", "14:30"],
  ])("A9: reads %j as %s", (input, expected) => {
    expect(parseDueTime(input)).toBe(expected);
  });

  it.each([
    ["24:00"],
    ["23:60"],
    ["13:00 PM"],
    ["0:30 AM"],
    ["9"],
    ["noon"],
    [""],
    [2359],
    [undefined],
  ])("A9: gives null for %j", (input) => {
    expect(parseDueTime(input)).toBeNull();
  });
});

describe("parseWeight", () => {
  it.each([
    [25, 25],
    [12.5, 12.5],
    ["25%", 25],
    ["12.5 %", 12.5],
    ["Worth 30% of the final grade", 30],
    [33.3333, 33.33],
    [150, 100],
    ["110%", 100],
    [-5, 0],
    [Number.NaN, 0],
    [Number.POSITIVE_INFINITY, 0],
    ["none", 0],
    [null, 0],
    [undefined, 0],
  ])("A9: reads %j as %s", (input, expected) => {
    expect(parseWeight(input)).toBe(expected);
  });
});

describe("cleanText", () => {
  it("collapses whitespace and trims", () => {
    expect(cleanText("  Assignment\n 1\t: Part  A ", 50)).toBe("Assignment 1 : Part A");
  });

  it("cuts long text without splitting a character", () => {
    expect(cleanText("abcdef", 3)).toBe("abc");
    expect(cleanText("ab 😀😀", 4)).toBe("ab 😀");
  });

  it("is empty for anything that isn't text", () => {
    expect(cleanText(3760, 10)).toBe("");
    expect(cleanText(undefined, 10)).toBe("");
  });
});

describe("normalizeExtractedAssessment", () => {
  const options = {
    fallbackCourseName: "CIS3760",
    fallbackAssignmentName: "Assessment 1",
    localDate: LOCAL_DATE,
  };

  // Realistic syllabus strings, as either extractor hands them over.
  it.each([
    [
      "a clean Gemini item",
      {
        courseName: "CIS 3760",
        assignmentName: "Assignment 1",
        dueDate: "2026-10-15",
        dueTime: "23:59",
        weight: 10,
      },
      {
        courseName: "CIS 3760",
        assignmentName: "Assignment 1",
        dueDate: "2026-10-15",
        dueTime: "23:59",
        weight: 10,
      },
    ],
    [
      "an abbreviated month and a 12-hour time",
      { assignmentName: "Midterm", dueDate: "Oct. 20, 2026", dueTime: "7:00 PM", weight: "25%" },
      {
        courseName: "CIS3760",
        assignmentName: "Midterm",
        dueDate: "2026-10-20",
        dueTime: "19:00",
        weight: 25,
      },
    ],
    [
      "DD/MM with the day over 12",
      { assignmentName: "Lab 3", dueDate: "20/11/2026", dueTime: "11:59 PM", weight: 5 },
      { assignmentName: "Lab 3", dueDate: "2026-11-20", dueTime: "23:59", weight: 5 },
    ],
    [
      "a missing time and weight",
      { assignmentName: "Final project", dueDate: "December 4, 2026" },
      { dueDate: "2026-12-04", dueTime: "23:59", weight: 0 },
    ],
    [
      "an out-of-range weight and time",
      { assignmentName: "Final exam", dueDate: "2026-12-15", dueTime: "25:00", weight: 120 },
      { dueDate: "2026-12-15", dueTime: "23:59", weight: 100 },
    ],
    [
      "a name split across lines",
      { assignmentName: "Assignment 2:\n  Requirements\n document", dueDate: "2026-10-29" },
      { assignmentName: "Assignment 2: Requirements document" },
    ],
    [
      "a missing name",
      { assignmentName: "   ", dueDate: "2026-10-29" },
      { assignmentName: "Assessment 1" },
    ],
  ])("A9: normalizes %s", (_label, raw, expected) => {
    const assessment = normalizeExtractedAssessment(raw, options);
    expect(assessment).toMatchObject({ ...expected, status: "Not started" });
    expect(assessment).not.toHaveProperty("needsReview");
  });

  it("A9: caps over-long names", () => {
    const assessment = normalizeExtractedAssessment(
      { courseName: "C".repeat(500), assignmentName: "A".repeat(500), dueDate: "2026-10-15" },
      options,
    );
    expect(assessment.courseName).toHaveLength(MAX_COURSE_NAME_LENGTH);
    expect(assessment.assignmentName).toHaveLength(MAX_ASSESSMENT_NAME_LENGTH);
  });

  it("A9: caps an over-long fallback course name too", () => {
    const assessment = normalizeExtractedAssessment(
      { assignmentName: "Quiz", dueDate: "2026-10-15" },
      { ...options, fallbackCourseName: "Intro ".repeat(100) },
    );
    expect(assessment.courseName.length).toBeLessThanOrEqual(MAX_COURSE_NAME_LENGTH);
  });

  it("falls back to Unknown Course when no course name is usable", () => {
    const assessment = normalizeExtractedAssessment(
      { assignmentName: "Quiz", dueDate: "2026-10-15" },
      { ...options, fallbackCourseName: "  " },
    );
    expect(assessment.courseName).toBe("Unknown Course");
  });

  it.each([
    ["no date", undefined],
    ["an unreadable date", "TBA"],
    ["an impossible date", "February 30, 2026"],
    ["a date whose day and month could swap", "03/04/2026"],
  ])("A9: flags %s for review, dated the local day", (_label, dueDate) => {
    const assessment = normalizeExtractedAssessment(
      { assignmentName: "Quiz 1", dueDate, dueTime: "9:00 AM" },
      options,
    );
    expect(assessment).toMatchObject({ dueDate: LOCAL_DATE, dueTime: "09:00", needsReview: true });
  });

  it("reads a date whose day and month could swap in the document's order", () => {
    const assessment = normalizeExtractedAssessment(
      { assignmentName: "Quiz 1", dueDate: "03/04/2026" },
      { ...options, dateOrder: "DMY" },
    );
    expect(assessment.dueDate).toBe("2026-04-03");
    expect(assessment).not.toHaveProperty("needsReview");
  });

  it("A9: always stores a valid date and time", () => {
    const junk = [
      undefined,
      null,
      42,
      "",
      "TBA",
      "6055-78-01",
      "25:99",
      "13/13/2026",
      "Sept 31, 2026",
    ];
    for (const dueDate of junk) {
      for (const dueTime of junk) {
        const { dueDate: date, dueTime: time } = normalizeExtractedAssessment(
          { dueDate, dueTime },
          options,
        );
        expect(parseDueDate(date)).toBe(date);
        expect(time).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
      }
    }
  });
});

describe("parseLocalDate", () => {
  const now = new Date(Date.UTC(2026, 9, 11, 12, 0));

  it.each([["2026-10-10"], ["2026-10-11"], ["2026-10-12"]])("accepts %s", (raw) => {
    expect(parseLocalDate(raw, now)).toBe(raw);
  });

  it.each([
    ["two days off", "2026-10-13"],
    ["not a real date", "2026-02-30"],
    ["not padded", "2026-10-1"],
    ["not ISO", "10/11/2026"],
    ["missing", undefined],
  ])("rejects a date %s", (_label, raw) => {
    expect(parseLocalDate(raw, now)).toBeNull();
  });
});
