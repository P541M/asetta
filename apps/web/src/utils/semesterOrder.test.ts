import { describe, expect, it } from "vitest";
import { timestamp } from "@/test/firestore";
import { sortSemesters } from "./semesterOrder";

const ids = (semesters: { id: string }[]) => semesters.map((semester) => semester.id);

describe("sortSemesters", () => {
  it("lists semesters by order", () => {
    const semesters = [
      { id: "c", order: 2 },
      { id: "a", order: 0 },
      { id: "b", order: 1 },
    ];
    expect(ids(sortSemesters(semesters))).toEqual(["a", "b", "c"]);
  });

  it("breaks a tie in order by document ID, as Firestore does", () => {
    const semesters = [
      { id: "b", order: 1 },
      { id: "a", order: 1 },
      { id: "c", order: 0 },
    ];
    expect(ids(sortSemesters(semesters))).toEqual(["c", "a", "b"]);
  });

  it("lists a semester without order instead of leaving it out", () => {
    expect(ids(sortSemesters([{ id: "fall-2024" }]))).toEqual(["fall-2024"]);
  });

  it("puts semesters without order first, so one added later (highest order plus 1) comes last", () => {
    const semesters = [
      { id: "new", order: 0 },
      { id: "old-2", createdAt: timestamp(new Date(2025, 0, 6)) },
      { id: "old-1", createdAt: timestamp(new Date(2024, 8, 3)) },
    ];
    expect(ids(sortSemesters(semesters))).toEqual(["old-1", "old-2", "new"]);
  });

  it("lists semesters without order oldest first, from a Timestamp or a stored Date", () => {
    const semesters = [
      { id: "a", createdAt: new Date(2025, 0, 6) },
      { id: "z", createdAt: timestamp(new Date(2024, 8, 3)) },
    ];
    expect(ids(sortSemesters(semesters))).toEqual(["z", "a"]);
  });

  it("counts a semester without a creation date as the oldest, then goes by ID", () => {
    const semesters = [
      { id: "b" },
      { id: "c", createdAt: timestamp(new Date(2024, 0, 8)) },
      { id: "a", createdAt: "not a date" },
    ];
    expect(ids(sortSemesters(semesters))).toEqual(["a", "b", "c"]);
  });

  it.each([
    ["null", null],
    ["a string", "1"],
    ["NaN", Number.NaN],
  ])("treats an order that is %s as missing", (_label, order) => {
    const semesters = [
      { id: "a", order: 0 },
      { id: "b", order },
    ];
    expect(ids(sortSemesters(semesters))).toEqual(["b", "a"]);
  });

  it("returns the semesters with their other fields, and leaves the list it was given as it was", () => {
    const semesters = [
      { id: "b", order: 1, name: "Winter 2027" },
      { id: "a", order: 0, name: "Fall 2026" },
    ];
    expect(sortSemesters(semesters).map((semester) => semester.name)).toEqual([
      "Fall 2026",
      "Winter 2027",
    ]);
    expect(ids(semesters)).toEqual(["b", "a"]);
  });
});
