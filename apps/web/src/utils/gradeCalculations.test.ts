import { describe, expect, it } from "vitest";
import { makeAssessment } from "@/test/assessments";
import type { AssessmentStatus } from "@/types/assessment";
import {
  applyMarkInput,
  breakdownStatus,
  calculateRequiredGrade,
  computeCurrentGrade,
  computeTotalWeight,
  currentGradeView,
  getGradeInfo,
  getProgressBarColor,
  parseTargetGradeInput,
  pendingEdits,
  requiredGradeView,
  resolveTargetGrade,
  withEdits,
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

  it("A10 (D1): counts a Missed assessment with no mark as 0", () => {
    expect(computeCurrentGrade([submitted(90, 50), missed(null, 50)])).toBeCloseTo(45);
  });

  it("A36: is null when every marked assessment weighs 0", () => {
    expect(computeCurrentGrade([submitted(95, 0)])).toBeNull();
  });

  it("leaves a weighted grade unchanged by a mark that weighs 0", () => {
    expect(computeCurrentGrade([submitted(95, 0), submitted(80, 20)])).toBeCloseTo(80);
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

  it("A10: is null when the remaining assessments carry no weight", () => {
    expect(calculateRequiredGrade([submitted(80, 100), notStarted(0)], 85, 100)).toBeNull();
  });

  it("A10 (D1): treats a Missed assessment with no mark as completed with 0", () => {
    // 45 earned, 0 from the missed one, 25 weight left: 25 / 25
    expect(
      calculateRequiredGrade([submitted(90, 50), missed(null, 25), notStarted(25)], 70, 100),
    ).toBeCloseTo(100);
  });
});

describe("requiredGradeView", () => {
  it("states the average needed, one decimal", () => {
    expect(requiredGradeView(88.333)).toEqual({ kind: "needed", text: "88.3", reachable: true });
  });

  it("flags an average above 100 as out of reach", () => {
    expect(requiredGradeView(112.5)).toEqual({ kind: "needed", text: "112.5", reachable: false });
  });

  it("reads reach from the shown value (100.04 shows 100.0, which is reachable)", () => {
    expect(requiredGradeView(100.04)).toEqual({ kind: "needed", text: "100.0", reachable: true });
  });

  it("A10: a target already secured (required below 0) doesn't render as a negative percentage", () => {
    expect(requiredGradeView(-12.5)).toEqual({ kind: "secured" });
  });

  it.each([0, 0.04, -0.04])("treats %f (shown as 0.0) as secured", (required) => {
    expect(requiredGradeView(required)).toEqual({ kind: "secured" });
  });
});

describe("applyMarkInput", () => {
  const course = [
    makeAssessment({ id: "a1", status: "Not started" }),
    makeAssessment({ id: "a2", status: "In progress", mark: null }),
  ];

  it.each(["Not started", "In progress"] as const)(
    "sets the mark and makes the assessment Submitted (was %s)",
    (status) => {
      const [edited] = applyMarkInput([makeAssessment({ id: "a1", status })], "a1", "87.5");
      expect(edited).toMatchObject({ mark: 87.5, status: "Submitted" });
    },
  );

  it.each(["Submitted", "Missed"] as const)(
    "A41: keeps the status (%s) when a mark is entered",
    (status) => {
      const [edited] = applyMarkInput([makeAssessment({ id: "a1", status })], "a1", "40");
      expect(edited).toMatchObject({ mark: 40, status });
    },
  );

  it.each(["Not started", "In progress", "Submitted", "Missed"] as const)(
    "A41: never changes the status (%s) when the mark is cleared",
    (status) => {
      const [edited] = applyMarkInput([makeAssessment({ id: "a1", status, mark: 70 })], "a1", "");
      expect(edited).toMatchObject({ mark: null, status });
    },
  );

  it("A41: a stray mark typed and deleted on a Missed assessment leaves it counting as 0", () => {
    const course = [
      makeAssessment({ id: "a1", status: "Submitted", mark: 90, weight: 50 }),
      makeAssessment({ id: "a2", status: "Missed", mark: null, weight: 50 }),
    ];
    const afterTypo = applyMarkInput(applyMarkInput(course, "a2", "5"), "a2", "");
    expect(afterTypo[1]).toMatchObject({ status: "Missed", mark: null });
    expect(computeCurrentGrade(afterTypo)).toBeCloseTo(45);
  });

  it("clears the mark for an empty field", () => {
    const marked = applyMarkInput(course, "a1", "87.5");
    expect(applyMarkInput(marked, "a1", "")[0].mark).toBeNull();
  });

  it.each([
    ["-5", 0],
    ["abc", 0],
    ["12.", 12],
  ])("parses %s as %f", (raw, mark) => {
    expect(applyMarkInput(course, "a1", raw)[0].mark).toBe(mark);
  });

  it("leaves the other assessments alone", () => {
    expect(applyMarkInput(course, "a1", "90")[1]).toBe(course[1]);
  });

  it("A10: clearing the only mark clears the current grade", () => {
    const marked = applyMarkInput([notStarted(20)], "a1", "90");
    expect(computeCurrentGrade(marked)).toBeCloseTo(90);
    expect(computeCurrentGrade(applyMarkInput(marked, "a1", ""))).toBeNull();
  });
});

describe("withEdits", () => {
  const live = [
    makeAssessment({ id: "a1", mark: null, weight: 20 }),
    makeAssessment({ id: "a2", mark: 70, weight: 30, status: "Submitted" }),
  ];

  it("shows each unsaved edit over the live assessment", () => {
    const shown = withEdits(live, { a1: { mark: 85, weight: 25, status: "Submitted" } });
    expect(shown[0]).toMatchObject({ id: "a1", mark: 85, weight: 25, status: "Submitted" });
    expect(shown[1]).toBe(live[1]);
  });

  it("is the live list when nothing is unsaved", () => {
    expect(withEdits(live, {})).toEqual(live);
  });
});

describe("pendingEdits", () => {
  const edit = { mark: 85, weight: 20, status: "Submitted" as const };

  it("keeps an edit the live data doesn't show yet (its save is still debounced)", () => {
    const edits = { a1: edit };
    expect(pendingEdits(edits, [makeAssessment({ id: "a1", mark: null, weight: 20 })])).toBe(edits);
  });

  it("drops an edit once the live data shows it (saved)", () => {
    const live = [makeAssessment({ id: "a1", mark: 85, weight: 20, status: "Submitted" })];
    expect(pendingEdits({ a1: edit }, live)).toEqual({});
  });

  it("matches a cleared mark to a doc without one", () => {
    const cleared = { mark: null, weight: 20, status: "Missed" as const };
    const live = [makeAssessment({ id: "a1", mark: undefined, weight: 20, status: "Missed" })];
    expect(pendingEdits({ a1: cleared }, live)).toEqual({});
  });

  it("drops an edit whose assessment is gone (deleted or moved to another course)", () => {
    expect(pendingEdits({ a1: edit }, [])).toEqual({});
  });

  it("keeps the other edits when one is saved", () => {
    const live = [
      makeAssessment({ id: "a1", mark: 85, weight: 20, status: "Submitted" }),
      makeAssessment({ id: "a2", mark: null, weight: 10 }),
    ];
    const other = { mark: 60, weight: 10, status: "Submitted" as const };
    expect(pendingEdits({ a1: edit, a2: other }, live)).toEqual({ a2: other });
  });
});

describe("resolveTargetGrade", () => {
  it("uses the saved target", () => {
    expect(resolveTargetGrade({ targetGrade: 70 })).toBe(70);
  });

  it("falls back to 85 without preferences", () => {
    expect(resolveTargetGrade(null)).toBe(85);
  });

  it("A10: a target grade of 0 stays 0 (GradeCalculator's `|| 85`)", () => {
    expect(resolveTargetGrade({ targetGrade: 0 })).toBe(0);
  });
});

describe("parseTargetGradeInput", () => {
  it.each([
    ["85", 85],
    ["72.5", 72.5],
    ["85.", 85],
    ["0", 0],
    ["100", 100],
  ])("reads %j as %f", (raw, target) => {
    expect(parseTargetGradeInput(raw)).toBe(target);
  });

  it.each(["", "  ", "-", ".", "abc"])(
    "A43: gives nothing to save for %j, so the saved target stays",
    (raw) => {
      expect(parseTargetGradeInput(raw)).toBeNull();
    },
  );

  it.each([
    ["150", 100],
    ["100.5", 100],
    ["-5", 0],
  ])("A43: clamps %j to %f", (raw, target) => {
    expect(parseTargetGradeInput(raw)).toBe(target);
  });
});

describe("breakdownStatus", () => {
  const now = new Date(2026, 9, 15, 12, 0);
  const row = (status: AssessmentStatus, dueDate: string, dueTime = "23:59") =>
    makeAssessment({ status, dueDate, dueTime });

  it("is submitted for a Submitted assessment, before or after its due date", () => {
    expect(breakdownStatus(row("Submitted", "2026-10-20"), now)).toBe("submitted");
    expect(breakdownStatus(row("Submitted", "2026-10-01"), now)).toBe("submitted");
  });

  it.each(["Not started", "In progress"] as const)(
    "is pending for %s before the due moment",
    (s) => {
      expect(breakdownStatus(row(s, "2026-10-20"), now)).toBe("pending");
      expect(breakdownStatus(row(s, "2026-10-15", "12:00"), now)).toBe("pending");
    },
  );

  it.each(["Not started", "In progress"] as const)("is overdue for %s once it has passed", (s) => {
    expect(breakdownStatus(row(s, "2026-10-15", "11:59"), now)).toBe("overdue");
    expect(breakdownStatus(row(s, "2026-10-01"), now)).toBe("overdue");
  });

  it("A53: is missed for a Missed assessment due later (it counts as 0, D1)", () => {
    expect(breakdownStatus(row("Missed", "2026-10-20"), now)).toBe("missed");
  });

  it("A53: is missed for a Missed assessment past its due date", () => {
    expect(breakdownStatus(row("Missed", "2026-10-01"), now)).toBe("missed");
  });
});

describe("currentGradeView", () => {
  it("shows the grade with one decimal, its band and its meter color", () => {
    expect(currentGradeView(86.04)).toEqual({
      value: 86,
      text: "86.0",
      info: getGradeInfo(86),
      barColor: "bg-success",
    });
  });

  it("A10: GradeOverviewCards picks the letter from the shown value (89.96 shows 90.0% and A+)", () => {
    const view = currentGradeView(89.96);
    expect(view.text).toBe("90.0");
    expect(view.info).toMatchObject({ letter: "A+", gpa: 4.0 });
  });

  it("A10: picks the meter color from the shown value too (84.96 shows 85.0%)", () => {
    const view = currentGradeView(84.96);
    expect(view.text).toBe("85.0");
    expect(view.barColor).toBe("bg-success");
  });
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
