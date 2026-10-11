import { describe, expect, it } from "vitest";
import { extractAssessmentsBasic, extractCourseName, formatDate } from "./textExtraction";

describe("formatDate", () => {
  it.each([
    ["2026-10-15", "2026-10-15"],
    ["October 15, 2026", "2026-10-15"],
    ["march 3 2026", "2026-03-03"],
    ["10/15/2026", "2026-10-15"],
    ["3/5/2026", "2026-03-05"],
    ["10-15-2026", "2026-10-15"],
    ["2026/3/5", "2026-03-05"],
    ["10/15/26", "2026-10-15"],
  ])("reads %j as %s", (input, expected) => {
    expect(formatDate(input)).toBe(expected);
  });

  it("returns text it can't read unchanged", () => {
    expect(formatDate("next Friday")).toBe("next Friday");
  });

  for (const [input, expected] of [
    ["Sept 30, 2026", "2026-09-30"],
    ["Mar 15, 2026", "2026-03-15"],
  ]) {
    it.fails(`A9: reads the abbreviated month in ${JSON.stringify(input)}`, () => {
      expect(formatDate(input)).toBe(expected);
    });
  }

  it.fails("A9: reads 15/03/2026 as March 15, not month 15", () => {
    expect(formatDate("15/03/2026")).toBe("2026-03-15");
  });

  it.todo("A9: range-checks the result (February 30, 2026 is not a date)");
});

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

  it.fails("A37: doesn't read a term such as Winter 2027 as the course code", () => {
    expect(extractCourseName("Course outline, Winter 2027\nCIS 3760 Software Engineering")).toBe(
      "CIS3760",
    );
  });
});

describe("extractAssessmentsBasic", () => {
  it("reads the type, number, date, time and weight from one line", () => {
    const text = "CIS 3760 Software Engineering\nAssignment 1 due 10/15/2026 at 11:59 PM (10%)";
    expect(extractAssessmentsBasic(text)).toEqual([
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
    expect(extractAssessmentsBasic(text)[0].dueTime).toBe(dueTime);
  });

  it("reads a date with a month name", () => {
    const [assessment] = extractAssessmentsBasic("Final Exam: December 12, 2026");
    expect(assessment).toMatchObject({ assignmentName: "Exam", dueDate: "2026-12-12" });
  });

  it("returns every match in order", () => {
    const text = "Quiz 1 due 10/01/2026\nQuiz 2 due 10/08/2026";
    expect(extractAssessmentsBasic(text).map((a) => [a.assignmentName, a.dueDate])).toEqual([
      ["Quiz 1", "2026-10-01"],
      ["Quiz 2", "2026-10-08"],
    ]);
  });

  it("falls back to an unknown course and no weight", () => {
    expect(extractAssessmentsBasic("Quiz 1 due 10/01/2026")[0]).toMatchObject({
      courseName: "Unknown Course",
      weight: 0,
    });
  });

  it("reads a paragraph that names an assessment and a date when no line matches", () => {
    const text =
      "MATH 1010 Calculus\n\nMidterm exam\nDate: October 20, 2026, 7:00 PM\nWorth 25% of the final grade";
    const assessments = extractAssessmentsBasic(text);
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
    expect(extractAssessmentsBasic("")).toEqual([]);
    expect(extractAssessmentsBasic("Office hours are on Tuesdays.")).toEqual([]);
  });

  it.todo("A9: normalizes every extracted assessment (date, padded time, weight 0 to 100)");
});
