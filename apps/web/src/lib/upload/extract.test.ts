import { beforeEach, describe, expect, it, vi } from "vitest";
import { GeminiLimitError, extractAssessmentsWithAI } from "./gemini";
import { assessmentsFromText, courseBreakdown } from "./extract";
import { normalizeExtractedAssessment } from "./normalize";

vi.mock("./gemini", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./gemini")>()),
  extractAssessmentsWithAI: vi.fn(),
}));

const ai = vi.mocked(extractAssessmentsWithAI);
const LOCAL_DATE = "2026-10-15";
const OUTLINE = "CIS 3760 Software Engineering\nAssignment 1 due 2026-10-20 worth 10%";

const assessment = (courseName: string, assignmentName: string) =>
  normalizeExtractedAssessment(
    { courseName, assignmentName, dueDate: "2026-10-20" },
    { fallbackCourseName: "", fallbackAssignmentName: "", localDate: LOCAL_DATE },
  );

describe("assessmentsFromText", () => {
  beforeEach(() => {
    ai.mockReset();
  });

  it("keeps Gemini's assessments", async () => {
    const found = [assessment("CIS3760", "Assignment 1")];
    ai.mockResolvedValue(found);
    expect(await assessmentsFromText(OUTLINE, LOCAL_DATE)).toBe(found);
  });

  it("falls back to the regex reading when Gemini fails", async () => {
    ai.mockRejectedValue(new Error("Gemini API key not configured"));
    const [first] = await assessmentsFromText(OUTLINE, LOCAL_DATE);
    expect(first).toMatchObject({
      courseName: "CIS3760",
      assignmentName: "Assignment 1",
      dueDate: "2026-10-20",
      weight: 10,
    });
  });

  it.each(["DAILY_QUOTA_EXCEEDED", "RATE_LIMITED"] as const)(
    "passes Gemini's %s on, with no fallback",
    async (limit) => {
      const error = new GeminiLimitError(limit);
      ai.mockRejectedValue(error);
      await expect(assessmentsFromText(OUTLINE, LOCAL_DATE)).rejects.toBe(error);
    },
  );

  it("falls back on a plain error that only reads like a limit", async () => {
    ai.mockRejectedValue(new Error("RATE_LIMITED"));
    expect(await assessmentsFromText(OUTLINE, LOCAL_DATE)).toHaveLength(1);
  });

  it("saves one placeholder for review when nothing is found", async () => {
    ai.mockResolvedValue([]);
    expect(await assessmentsFromText("CIS 3760 reading list", LOCAL_DATE)).toEqual([
      {
        courseName: "CIS3760",
        assignmentName: "Manual Review Required",
        dueDate: LOCAL_DATE,
        dueTime: "23:59",
        weight: 0,
        status: "Not started",
        needsReview: true,
      },
    ]);
  });

  it("names the placeholder's course Unknown Course when the text has none", async () => {
    ai.mockRejectedValue(new Error("network"));
    const [placeholder] = await assessmentsFromText("Nothing useful here", LOCAL_DATE);
    expect(placeholder.courseName).toBe("Unknown Course");
  });
});

describe("courseBreakdown", () => {
  it("counts each course's assessments in the order the courses first appear", () => {
    expect(
      courseBreakdown([
        { courseName: "MATH1010" },
        { courseName: "CIS3760" },
        { courseName: "MATH1010" },
        { courseName: "CIS3760" },
        { courseName: "MATH1010" },
      ]),
    ).toEqual([
      { courseName: "MATH1010", assessmentCount: 3 },
      { courseName: "CIS3760", assessmentCount: 2 },
    ]);
  });

  it("is empty for no assessments", () => {
    expect(courseBreakdown([])).toEqual([]);
  });
});
