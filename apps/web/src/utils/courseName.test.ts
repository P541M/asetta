import { describe, expect, it } from "vitest";
import {
  courseNameFromPreferencesDocId,
  coursePreferencesDocId,
  validateCourseName,
} from "./courseName";
import { isValidDocId } from "./validation";

// Every name Firestore takes as one document ID: these docs exist today under the raw name.
const PLAIN_NAMES = [
  "CIS 3760",
  "CIS*3760",
  "COMP-1405",
  "MATH 1010A",
  "Intro to Psychology (PSYC 1000)",
  "100% attendance",
  "C# & .NET",
  "What? [Lab] A\\B",
  "Français 1001",
  "日本語 1",
  "a.b",
  "_init_",
  "__init",
];

const SLASH_NAMES = ["MATH/STAT 2050", "ENG 1001/ENG 1002/ENG 1003", "CIS/", "/", "a//b"];
const RESERVED_NAMES = [".", "..", "__init__", "____"];
// Names that look like an escaped ID, or like one escaped twice.
const PERCENT_NAMES = ["%", "%A", "%A%2FB", "%A/B", "A%2FB", "%A%252FB", "%.", "%25"];
const ALL_NAMES = [...PLAIN_NAMES, ...SLASH_NAMES, ...RESERVED_NAMES, ...PERCENT_NAMES];

describe("coursePreferencesDocId", () => {
  it.each(PLAIN_NAMES)("keeps %j as its own ID, so existing docs keep theirs", (name) => {
    expect(coursePreferencesDocId(name)).toBe(name);
  });

  it("A13: gives a cross-listed name one document ID", () => {
    expect(coursePreferencesDocId("MATH/STAT 2050")).toBe("%MATH%2FSTAT 2050");
    expect(coursePreferencesDocId("ENG 1001/ENG 1002/ENG 1003")).toBe(
      "%ENG 1001%2FENG 1002%2FENG 1003",
    );
  });

  it("A13: escapes the names Firestore reserves", () => {
    expect(RESERVED_NAMES.map(coursePreferencesDocId)).toEqual(["%.", "%..", "%__init__", "%____"]);
  });

  it("escapes a name that starts with %, so it never takes another name's escaped ID", () => {
    expect(coursePreferencesDocId("%A%2FB")).toBe("%%25A%252FB");
    expect(coursePreferencesDocId("%A%2FB")).not.toBe(coursePreferencesDocId("A/B"));
  });

  it.each(ALL_NAMES)("A13: makes %j a valid document ID", (name) => {
    expect(isValidDocId(coursePreferencesDocId(name))).toBe(true);
  });

  it("A13: gives every name its own ID", () => {
    expect(new Set(ALL_NAMES.map(coursePreferencesDocId)).size).toBe(ALL_NAMES.length);
  });
});

describe("courseNameFromPreferencesDocId", () => {
  it("reads an ID written before A13 as the course name", () => {
    expect(courseNameFromPreferencesDocId("CIS 3760")).toBe("CIS 3760");
    expect(courseNameFromPreferencesDocId("100% attendance")).toBe("100% attendance");
  });

  it.each(ALL_NAMES)("A13: reads the ID of %j back as that name", (name) => {
    expect(courseNameFromPreferencesDocId(coursePreferencesDocId(name))).toBe(name);
  });

  it("reads no name from an ID it never makes, so it can't land on another course", () => {
    // Saved before A13 for "%Stats"; decoding it would give "Stats", another course's name.
    expect(courseNameFromPreferencesDocId("%Stats")).toBeNull();
    expect(courseNameFromPreferencesDocId("%25")).toBeNull();
    expect(courseNameFromPreferencesDocId("%A%2Z")).toBeNull();
  });
});

describe("validateCourseName", () => {
  it("rejects an empty name", () => {
    expect(validateCourseName("")).toMatch(/empty/i);
    expect(validateCourseName("   ")).toMatch(/empty/i);
  });

  it("rejects a name over 100 characters", () => {
    expect(validateCourseName("x".repeat(100))).toBeNull();
    expect(validateCourseName("x".repeat(101))).toMatch(/100/);
  });

  it("A13: accepts a cross-listed name", () => {
    expect(validateCourseName("MATH/STAT 2050")).toBeNull();
  });

  it("A13: accepts the characters only the old document ID ruled out", () => {
    expect(validateCourseName("C# 1001")).toBeNull();
    expect(validateCourseName("What? 1000")).toBeNull();
    expect(validateCourseName("[Lab] A\\B")).toBeNull();
  });
});
