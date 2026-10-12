import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeAssessment } from "@/test/assessments";
import {
  assessmentFromDoc,
  computeStats,
  courseNames,
  processCourseStats,
} from "./semesterAssessments";

describe("assessmentFromDoc", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 11, 23, 30));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const stored = {
    courseName: "CIS 3760",
    assignmentName: "Midterm",
    dueDate: "2026-10-14",
    dueTime: "10:00",
    weight: 30,
    status: "Submitted",
    notes: "<p>Room 101</p>",
  };

  it("maps every field of a full doc", () => {
    expect(assessmentFromDoc("cis-mid", stored)).toEqual({
      id: "cis-mid",
      courseName: "CIS 3760",
      assignmentName: "Midterm",
      dueDate: "2026-10-14",
      dueTime: "10:00",
      weight: 30,
      status: "Submitted",
      notes: "<p>Room 101</p>",
      needsReview: false,
    });
  });

  it("fills in every missing field", () => {
    expect(assessmentFromDoc("x", {})).toEqual({
      id: "x",
      courseName: "Unknown Course",
      assignmentName: "Unknown Assessment",
      dueDate: "2026-10-11",
      dueTime: "23:59",
      weight: 0,
      status: "Not started",
      notes: "",
      needsReview: false,
    });
  });

  it("reads cleared notes as empty", () => {
    expect(assessmentFromDoc("x", { ...stored, notes: null }).notes).toBe("");
  });

  it("flags for review only on a true needsReview", () => {
    expect(assessmentFromDoc("x", { ...stored, needsReview: true }).needsReview).toBe(true);
    expect(assessmentFromDoc("x", { ...stored, needsReview: "true" }).needsReview).toBe(false);
  });

  it("A11: keeps the mark", () => {
    expect(assessmentFromDoc("x", { ...stored, mark: 85 }).mark).toBe(85);
  });

  it("A11: keeps a cleared mark as null", () => {
    expect(assessmentFromDoc("x", { ...stored, mark: null })).toHaveProperty("mark", null);
  });

  it("leaves out a mark the doc doesn't have", () => {
    expect(assessmentFromDoc("x", stored)).not.toHaveProperty("mark");
  });

  it("A11: keeps createdAt and updatedAt", () => {
    const createdAt = new Date(2026, 8, 1);
    const updatedAt = new Date(2026, 9, 10);
    const assessment = assessmentFromDoc("x", { ...stored, createdAt, updatedAt });
    expect(assessment.createdAt).toBe(createdAt);
    expect(assessment.updatedAt).toBe(updatedAt);
  });
});

describe("courseNames", () => {
  it("lists each course once, sorted", () => {
    const assessments = [
      makeAssessment({ courseName: "MATH 1200" }),
      makeAssessment({ courseName: "CIS 3760" }),
      makeAssessment({ courseName: "MATH 1200" }),
    ];
    expect(courseNames(assessments)).toEqual(["CIS 3760", "MATH 1200"]);
  });

  it("is empty for no assessments", () => {
    expect(courseNames([])).toEqual([]);
  });
});

describe("processCourseStats", () => {
  const now = new Date(2026, 9, 11, 12, 0);

  it("groups by course, sorted by name", () => {
    const stats = processCourseStats(
      [
        makeAssessment({ id: "1", courseName: "MATH 1200" }),
        makeAssessment({ id: "2", courseName: "CIS 3760" }),
      ],
      now,
    );
    expect(stats.map((s) => s.courseName)).toEqual(["CIS 3760", "MATH 1200"]);
  });

  it("counts Submitted and Missed as completed, with a rounded progress", () => {
    const [stats] = processCourseStats(
      [
        makeAssessment({ id: "1", status: "Submitted" }),
        makeAssessment({ id: "2", status: "Missed" }),
        makeAssessment({ id: "3", status: "In progress" }),
      ],
      now,
    );
    expect(stats).toMatchObject({
      totalAssessments: 3,
      completedAssessments: 2,
      pendingAssessments: 1,
      progress: 67,
    });
  });

  it("takes the earliest open, unflagged, future assessment as the next deadline", () => {
    const [stats] = processCourseStats(
      [
        makeAssessment({ id: "late", assignmentName: "Final", dueDate: "2026-12-04" }),
        makeAssessment({ id: "past", assignmentName: "Quiz 0", dueDate: "2026-10-10" }),
        makeAssessment({
          id: "done",
          assignmentName: "A1",
          dueDate: "2026-10-12",
          status: "Submitted",
        }),
        makeAssessment({
          id: "flag",
          assignmentName: "Lab",
          dueDate: "2026-10-11",
          needsReview: true,
        }),
        makeAssessment({ id: "next", assignmentName: "Midterm", dueDate: "2026-10-14" }),
      ],
      now,
    );
    expect(stats.nextAssignment).toBe("Midterm");
    expect(stats.nextDueDate).toBe("2026-10-14");
  });

  it("counts an assessment due later today as upcoming", () => {
    const [stats] = processCourseStats(
      [makeAssessment({ assignmentName: "Lab", dueDate: "2026-10-11", dueTime: "17:00" })],
      now,
    );
    expect(stats.nextAssignment).toBe("Lab");
  });

  it("has no next deadline when nothing is open", () => {
    const [stats] = processCourseStats(
      [makeAssessment({ status: "Submitted" }), makeAssessment({ dueDate: "2026-10-01" })],
      now,
    );
    expect(stats.nextDueDate).toBeNull();
    expect(stats.nextAssignment).toBeNull();
  });

  it("is empty for no assessments", () => {
    expect(processCourseStats([], now)).toEqual([]);
  });
});

describe("computeStats", () => {
  const now = new Date(2026, 9, 11, 12, 0);

  it("counts each status and the completion rate", () => {
    const stats = computeStats(
      [
        makeAssessment({ id: "1", status: "Not started" }),
        makeAssessment({ id: "2", status: "Not started" }),
        makeAssessment({ id: "3", status: "In progress" }),
        makeAssessment({ id: "4", status: "Submitted" }),
      ],
      now,
    );
    expect(stats).toMatchObject({ total: 4, notStarted: 2, inProgress: 1, completionRate: 25 });
  });

  it("counts Missed toward the completion rate", () => {
    const stats = computeStats(
      [makeAssessment({ status: "Missed" }), makeAssessment({ status: "Not started" })],
      now,
    );
    expect(stats.completionRate).toBe(50);
  });

  it.fails("A51: counts only Submitted assessments as submitted", () => {
    const stats = computeStats(
      [makeAssessment({ status: "Submitted" }), makeAssessment({ status: "Missed" })],
      now,
    );
    expect(stats.submitted).toBe(1);
  });

  it("is all zeros for no assessments", () => {
    expect(computeStats([], now)).toEqual({
      total: 0,
      notStarted: 0,
      inProgress: 0,
      submitted: 0,
      upcomingDeadlines: 0,
      completionRate: 0,
    });
  });

  it("counts open, unflagged assessments due in the next 7 days as upcoming", () => {
    const stats = computeStats(
      [
        makeAssessment({ id: "in", dueDate: "2026-10-14", dueTime: "10:00" }),
        makeAssessment({ id: "edge", dueDate: "2026-10-18", dueTime: "12:00" }),
        makeAssessment({ id: "after", dueDate: "2026-10-18", dueTime: "12:01" }),
        makeAssessment({ id: "past", dueDate: "2026-10-11", dueTime: "11:59" }),
        makeAssessment({ id: "done", dueDate: "2026-10-13", status: "Submitted" }),
        makeAssessment({ id: "flag", dueDate: "2026-10-13", needsReview: true }),
      ],
      now,
    );
    expect(stats.upcomingDeadlines).toBe(2);
  });

  it("measures the week in local days across the March DST switch", () => {
    const stats = computeStats(
      [
        makeAssessment({ id: "edge", dueDate: "2026-03-09", dueTime: "10:00" }),
        makeAssessment({ id: "after", dueDate: "2026-03-09", dueTime: "10:01" }),
      ],
      new Date(2026, 2, 2, 10, 0),
    );
    expect(stats.upcomingDeadlines).toBe(1);
  });

  it("measures the week in local days across the November DST switch", () => {
    const stats = computeStats(
      [
        makeAssessment({ id: "edge", dueDate: "2026-11-04", dueTime: "10:00" }),
        makeAssessment({ id: "after", dueDate: "2026-11-04", dueTime: "10:01" }),
      ],
      new Date(2026, 9, 28, 10, 0),
    );
    expect(stats.upcomingDeadlines).toBe(1);
  });
});
