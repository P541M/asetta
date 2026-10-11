import { describe, expect, it } from "vitest";
import { COURSE_COLOR_PRESETS, isValidCourseColor, resolveCourseColor } from "./courseColors";

describe("COURSE_COLOR_PRESETS", () => {
  it("keeps its order, which every unset course's default depends on", () => {
    expect(COURSE_COLOR_PRESETS).toEqual([
      "#3B82F6",
      "#0D9488",
      "#65A30D",
      "#A16207",
      "#9333EA",
      "#EC4899",
    ]);
  });
});

describe("isValidCourseColor", () => {
  it.each(["#3B82F6", "#3b82f6", "#000000"])("accepts %j", (value) => {
    expect(isValidCourseColor(value)).toBe(true);
  });

  it.each([["#3B82F"], ["3B82F6"], ["#3B82F6FF"], ["#GGGGGG"], [""], [undefined], [0x3b82f6]])(
    "rejects %j",
    (value) => {
      expect(isValidCourseColor(value)).toBe(false);
    },
  );
});

describe("resolveCourseColor", () => {
  it("uses a valid stored color, uppercased", () => {
    expect(resolveCourseColor("#ec4899", "CIS 3760")).toBe("#EC4899");
  });

  it("falls back to a preset when nothing valid is stored", () => {
    for (const stored of [undefined, "", "red", "#12345"]) {
      expect(COURSE_COLOR_PRESETS).toContain(resolveCourseColor(stored, "CIS 3760"));
    }
  });

  it("gives a course the same default every time", () => {
    expect(resolveCourseColor(undefined, "CIS 3760")).toBe(
      resolveCourseColor("not a color", "CIS 3760"),
    );
  });

  it.each([
    ["CIS 3760", "#65A30D"],
    ["MATH 1010", "#A16207"],
    ["Unknown Course", "#3B82F6"],
  ])("keeps the default for %j (users already see it)", (courseName, color) => {
    expect(resolveCourseColor(undefined, courseName)).toBe(color);
  });
});
