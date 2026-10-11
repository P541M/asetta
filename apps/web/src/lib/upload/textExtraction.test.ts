import { describe, expect, it } from "vitest";
import { parseDueDate } from "./normalize";
import { extractAssessmentsBasic, extractCourseName } from "./textExtraction";

// The uploader's local today: the date of an assessment flagged for review.
const LOCAL_DATE = "2026-10-11";

describe("extractCourseName", () => {
  it.each([
    ["CIS 3760 Software Engineering", "CIS3760"],
    ["MATH1010A Calculus", "MATH1010A"],
    ["Course: Intro to Programming", "Intro to Programming"],
  ])("reads %j as %s", (text, expected) => {
    expect(extractCourseName(text)).toBe(expected);
  });

  it("is null when there is no code or course title", () => {
    expect(extractCourseName("Welcome to the class")).toBeNull();
  });

  it("A37: doesn't read a term such as Winter 2027 as the course code", () => {
    expect(extractCourseName("Course outline, Winter 2027\nCIS 3760 Software Engineering")).toBe(
      "CIS3760",
    );
  });

  it.each([
    ["Fall 2026 syllabus\nCIS 3760", "CIS3760"],
    ["Summer 2026\nMATH 1200 Linear Algebra", "MATH1200"],
    ["FALL 2026\nCIS 3760", "CIS3760"],
    ["WINTER 2027 ENGG 4450", "ENGG4450"],
  ])("A37: skips the term in %j", (text, expected) => {
    expect(extractCourseName(text)).toBe(expected);
  });

  it.each([
    ["CIS*3760 Software Engineering", "CIS3760"],
    ["COMP-1405 Intro to Computer Science", "COMP1405"],
    ["CIS3760", "CIS3760"],
    ["Course code: ECON 101", "ECON101"],
  ])("A37: reads the code format in %j as %s", (text, expected) => {
    expect(extractCourseName(text)).toBe(expected);
  });

  it.each([
    ["lowercase letters", "see room 2026 on the map"],
    ["letters inside a word", "Interim 2026 notes"],
  ])("A37: needs capitals at a word boundary (%s)", (_label, text) => {
    expect(extractCourseName(text)).toBeNull();
  });
});

describe("extractAssessmentsBasic", () => {
  it("reads the type, number, date, time and weight from one line", () => {
    const text = "CIS 3760 Software Engineering\nAssignment 1 due 10/15/2026 at 11:59 PM (10%)";
    expect(extractAssessmentsBasic(text, LOCAL_DATE)).toEqual([
      {
        courseName: "CIS3760",
        assignmentName: "Assignment 1",
        dueDate: "2026-10-15",
        dueTime: "23:59",
        weight: 10,
        status: "Not started",
      },
    ]);
  });

  it.each([
    ["Quiz 2 due 11/02/2026 at 9:30 AM", "09:30"],
    ["Exam due 12/10/2026 at 12:00 AM", "00:00"],
    ["Lab 3 due 10/20/2026 at 12:15 PM", "12:15"],
    ["Project due 11/30/2026 14:00", "14:00"],
    ["Paper due 12/01/2026", "23:59"],
  ])("reads the time in %j as %s", (text, dueTime) => {
    expect(extractAssessmentsBasic(text, LOCAL_DATE)[0].dueTime).toBe(dueTime);
  });

  it("reads a date with a month name", () => {
    const [assessment] = extractAssessmentsBasic("Final Exam: December 12, 2026", LOCAL_DATE);
    expect(assessment).toMatchObject({ assignmentName: "Exam", dueDate: "2026-12-12" });
  });

  it("returns every match in order", () => {
    const text = "Quiz 1 due 10/13/2026\nQuiz 2 due 10/20/2026";
    expect(
      extractAssessmentsBasic(text, LOCAL_DATE).map((a) => [a.assignmentName, a.dueDate]),
    ).toEqual([
      ["Quiz 1", "2026-10-13"],
      ["Quiz 2", "2026-10-20"],
    ]);
  });

  it("falls back to an unknown course and no weight", () => {
    expect(extractAssessmentsBasic("Quiz 1 due 10/13/2026", LOCAL_DATE)[0]).toMatchObject({
      courseName: "Unknown Course",
      weight: 0,
    });
  });

  it("reads a paragraph that names an assessment and a date when no line matches", () => {
    const text =
      "MATH 1010 Calculus\n\nMidterm exam\nDate: October 20, 2026, 7:00 PM\nWorth 25% of the final grade";
    const assessments = extractAssessmentsBasic(text, LOCAL_DATE);
    expect(assessments).toHaveLength(1);
    expect(assessments[0]).toMatchObject({
      courseName: "MATH1010",
      dueDate: "2026-10-20",
      dueTime: "19:00",
      weight: 25,
      status: "Not started",
    });
  });

  it("finds nothing in text without assessments", () => {
    expect(extractAssessmentsBasic("", LOCAL_DATE)).toEqual([]);
    expect(extractAssessmentsBasic("Office hours are on Tuesdays.", LOCAL_DATE)).toEqual([]);
  });

  it("reads a decimal weight", () => {
    const [assessment] = extractAssessmentsBasic("Quiz 1 due 10/13/2026 (12.5%)", LOCAL_DATE);
    expect(assessment.weight).toBe(12.5);
  });

  it("A9: reads day-first dates when the outline settles the order", () => {
    const text = "Quiz 1 due 03/10/2026\nQuiz 2 due 17/10/2026";
    expect(extractAssessmentsBasic(text, LOCAL_DATE).map((a) => a.dueDate)).toEqual([
      "2026-10-03",
      "2026-10-17",
    ]);
  });

  it("A9: flags a date whose day and month could swap when nothing settles it (D10)", () => {
    const text = "Quiz 1 due 03/04/2026\nQuiz 2 due 05/06/2026";
    const assessments = extractAssessmentsBasic(text, LOCAL_DATE);
    expect(assessments).toHaveLength(2);
    for (const assessment of assessments) {
      expect(assessment).toMatchObject({ dueDate: LOCAL_DATE, needsReview: true });
    }
  });

  it("A9: flags an impossible date for review on the local day, not the UTC day", () => {
    const text = "MATH 1010 Calculus\n\nMidterm exam\nDate: Sep 31, 2026, 7:00 PM";
    expect(extractAssessmentsBasic(text, LOCAL_DATE)).toEqual([
      expect.objectContaining({ dueDate: LOCAL_DATE, dueTime: "19:00", needsReview: true }),
    ]);
  });

  it("A9: reads an ISO date, on its own line or in a paragraph", () => {
    expect(extractAssessmentsBasic("Quiz 1 due 2026-10-15", LOCAL_DATE)[0].dueDate).toBe(
      "2026-10-15",
    );
    const text = "MATH 1010 Calculus\n\nMidterm exam\nDate: 2026-10-15";
    expect(extractAssessmentsBasic(text, LOCAL_DATE)[0].dueDate).toBe("2026-10-15");
  });

  it("A9: normalizes every extracted assessment (date, padded time, weight 0 to 100)", () => {
    const syllabus = [
      "CIS 3760 Software Engineering, Fall 2026",
      "Assignment 1 due Sept. 30, 2026 at 11:59 PM (10%)",
      "Quiz 1 due 15/10/2026 at 9:30 AM (5%)",
      "Lab 2 due 20/10/2026 14:00 (5%)",
      "Project due Dec. 1st, 2026 (130%)",
      "Exam due 13/13/2026 (40%)",
    ].join("\n");
    const assessments = extractAssessmentsBasic(syllabus, LOCAL_DATE);
    expect(assessments.map((a) => [a.assignmentName, a.dueDate, a.dueTime, a.weight])).toEqual([
      ["Assignment 1", "2026-09-30", "23:59", 10],
      ["Quiz 1", "2026-10-15", "09:30", 5],
      ["Lab 2", "2026-10-20", "14:00", 5],
      ["Project", "2026-12-01", "23:59", 100],
      ["Exam", LOCAL_DATE, "23:59", 40],
    ]);
    expect(assessments.map((a) => a.needsReview)).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
      true,
    ]);
    for (const assessment of assessments) {
      expect(assessment.courseName).toBe("CIS3760");
      expect(parseDueDate(assessment.dueDate)).toBe(assessment.dueDate);
      expect(assessment.dueTime).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
    }
  });
});
