import { describe, expect, it } from "vitest";
import { makeAssessment } from "@/test/assessments";
import {
  calculateRequiredGrade,
  computeCurrentGrade,
  computeTotalWeight,
  getGradeInfo,
  getProgressBarColor,
} from "./gradeCalculations";

const submitted = (mark: number | null, weight: number) =>
  makeAssessment({ status: "Submitted", mark, weight });
const missed = (mark: number | null, weight: number) =>
  makeAssessment({ status: "Missed", mark, weight });
const notStarted = (weight: number) => makeAssessment({ status: "Not started", weight });

describe("computeCurrentGrade", () => {
  it("is null with no assessments", () => {
    expect(computeCurrentGrade([])).toBeNull();
  });

  it("is null until something is completed and marked", () => {
    expect(
      computeCurrentGrade([
        makeAssessment({ status: "In progress", mark: 90 }),
        submitted(null, 20),
        notStarted(30),
      ]),
    ).toBeNull();
  });

  it("is the weighted average of completed, marked assessments", () => {
    expect(computeCurrentGrade([submitted(80, 20), submitted(90, 30)])).toBeCloseTo(86);
  });

  it("ignores a mark on an assessment that isn't completed", () => {
    expect(
      computeCurrentGrade([
        submitted(80, 20),
        makeAssessment({ status: "In progress", mark: 100 }),
      ]),
    ).toBeCloseTo(80);
  });

  it("counts a Missed assessment that has a mark", () => {
    expect(computeCurrentGrade([missed(0, 10), submitted(100, 10)])).toBeCloseTo(50);
  });

  it.fails("A10 (D1): counts a Missed assessment with no mark as 0", () => {
    expect(computeCurrentGrade([submitted(90, 50), missed(null, 50)])).toBeCloseTo(45);
  });

  it.fails("A36: is null when every marked assessment weighs 0", () => {
    expect(computeCurrentGrade([submitted(95, 0)])).toBeNull();
  });
});

describe("computeTotalWeight", () => {
  it("sums every weight, completed or not", () => {
    expect(computeTotalWeight([submitted(80, 10), notStarted(20.5), notStarted(0)])).toBe(30.5);
  });

  it("is 0 with no assessments", () => {
    expect(computeTotalWeight([])).toBe(0);
  });
});

describe("calculateRequiredGrade", () => {
  it("is null when everything is completed and marked", () => {
    expect(calculateRequiredGrade([submitted(80, 50), submitted(90, 50)], 85, 100)).toBeNull();
  });

  it("is the average needed on the remaining weight", () => {
    // 85 target, 32 earned, 60 weight left: 53 / 60
    expect(calculateRequiredGrade([submitted(80, 40), notStarted(60)], 85, 100)).toBeCloseTo(
      88.333,
    );
  });

  it("scales the target to the course's total weight", () => {
    // 80% of 90 is 72; 24 earned; 48 needed on 60
    expect(calculateRequiredGrade([submitted(80, 30), notStarted(60)], 80, 90)).toBeCloseTo(80);
  });

  it("counts a submitted assessment without a mark as still to earn", () => {
    expect(calculateRequiredGrade([submitted(100, 50), submitted(null, 50)], 80, 100)).toBeCloseTo(
      60,
    );
  });

  it.fails("A10: is null when the remaining assessments carry no weight", () => {
    expect(calculateRequiredGrade([submitted(80, 100), notStarted(0)], 85, 100)).toBeNull();
  });

  it.fails("A10 (D1): treats a Missed assessment with no mark as completed with 0", () => {
    // 45 earned, 0 from the missed one, 25 weight left: 25 / 25
    expect(
      calculateRequiredGrade([submitted(90, 50), missed(null, 25), notStarted(25)], 70, 100),
    ).toBeCloseTo(100);
  });

  it.todo(
    "A10: a target already secured (required below 0) doesn't render as a negative percentage",
  );
});

describe("getGradeInfo", () => {
  it.each([
    [100, "A+", 4.0],
    [90, "A+", 4.0],
    [89.99, "A", 4.0],
    [85, "A", 4.0],
    [84.99, "A-", 3.7],
    [80, "A-", 3.7],
    [79.99, "B+", 3.3],
    [77, "B+", 3.3],
    [73, "B", 3.0],
    [70, "B-", 2.7],
    [67, "C+", 2.3],
    [63, "C", 2.0],
    [60, "C-", 1.7],
    [57, "D+", 1.3],
    [53, "D", 1.0],
    [50, "D-", 0.7],
    [49.99, "F", 0.0],
    [0, "F", 0.0],
  ])("maps %f to %s (%f)", (percentage, letter, gpa) => {
    expect(getGradeInfo(percentage)).toMatchObject({ letter, gpa });
  });

  it.each([
    [80, "bg-success/10 text-success"],
    [79.99, "bg-primary/10 text-primary"],
    [60, "bg-primary/10 text-primary"],
    [59.99, "bg-destructive/10 text-destructive"],
  ])("tints %f with %s", (percentage, tintClass) => {
    expect(getGradeInfo(percentage).tintClass).toBe(tintClass);
  });

  it.todo(
    "A10: GradeOverviewCards picks the letter from the shown value (89.96 shows 90.0% and A+)",
  );
  it.todo("A10: a target grade of 0 stays 0 (GradeCalculator's `|| 85`)");
  it.todo(
    "A10: clearing the only mark clears the current grade (GradeCalculator's recalculateGrade)",
  );
});

describe("getProgressBarColor", () => {
  it.each([
    [85, "bg-success"],
    [84.99, "bg-primary"],
    [60, "bg-primary"],
    [59.99, "bg-destructive"],
  ])("colors %f with %s", (percentage, colorClass) => {
    expect(getProgressBarColor(percentage)).toBe(colorClass);
  });
});
