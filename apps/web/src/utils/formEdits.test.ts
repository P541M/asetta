import { describe, expect, it } from "vitest";
import { formWithEdits, isDirty, unsavedEdits } from "./formEdits";

const live = { name: "Sam", days: 3, on: true };

describe("formWithEdits", () => {
  it("is the live values with no edits", () => {
    expect(formWithEdits(live, {})).toEqual(live);
  });

  it("lays the edits over the live values", () => {
    expect(formWithEdits(live, { name: "Sam L." })).toEqual({ ...live, name: "Sam L." });
  });

  it("keeps an emptied field and a switch turned off", () => {
    expect(formWithEdits(live, { name: "", on: false })).toEqual({ ...live, name: "", on: false });
  });

  it("follows a live change to a field the student hasn't edited", () => {
    const edits = { name: "Sam L." };
    expect(formWithEdits({ ...live, days: 7 }, edits)).toEqual({
      name: "Sam L.",
      days: 7,
      on: true,
    });
  });

  it("keeps the student's edit over a live change to the same field", () => {
    expect(formWithEdits({ ...live, name: "Samuel" }, { name: "Sam L." }).name).toBe("Sam L.");
  });
});

describe("unsavedEdits", () => {
  it("drops edits that match the saved values", () => {
    expect(unsavedEdits({ name: "Sam", days: 3 }, live)).toEqual({});
  });

  it("keeps edits that differ from the saved values", () => {
    expect(unsavedEdits({ name: "Sam L.", days: 3 }, live)).toEqual({ name: "Sam L." });
  });

  it("keeps a field typed in while a save was running", () => {
    const submitted = { ...live, name: "Sam L" };
    expect(unsavedEdits({ name: "Sam Le" }, submitted)).toEqual({ name: "Sam Le" });
  });

  it("has nothing left when there were no edits", () => {
    expect(unsavedEdits({}, live)).toEqual({});
  });
});

describe("isDirty", () => {
  it("is clean with no edits", () => {
    expect(isDirty({}, live)).toBe(false);
  });

  it("is dirty when an edit differs from what is loaded", () => {
    expect(isDirty({ name: "Sam L." }, live)).toBe(true);
    expect(isDirty({ on: false }, live)).toBe(true);
    expect(isDirty({ days: 7 }, live)).toBe(true);
  });

  it("is clean again when an edit goes back to what is loaded", () => {
    expect(isDirty({ name: "Sam", days: 3 }, live)).toBe(false);
  });

  it("is clean when what is loaded catches up with the edit", () => {
    expect(isDirty({ name: "Sam L." }, { ...live, name: "Sam L." })).toBe(false);
  });

  it("compares text as typed, so a trailing space counts", () => {
    expect(isDirty({ name: "Sam " }, live)).toBe(true);
  });
});
