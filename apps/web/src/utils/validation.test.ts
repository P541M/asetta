import { describe, expect, it } from "vitest";
import { isValidDocId } from "./validation";

describe("isValidDocId", () => {
  it.each([
    ["an auto ID", "x7Kq2LmN9pQrS4tUvW1y"],
    ["a readable ID", "fall-2026"],
    ["an ID with spaces and dots", "Fall 2026 v1.2"],
    ["a single dot inside a word", "a.b"],
  ])("accepts %s", (_case, id) => {
    expect(isValidDocId(id)).toBe(true);
  });

  it.each([
    ["an empty string", ""],
    ["a slash", "a/b"],
    ["a path into another collection", "abc/assessments/xyz"],
    ["a leading slash", "/abc"],
    ["a lone slash", "/"],
    ["a single dot", "."],
    ["a double dot", ".."],
    ["a reserved __name__", "__abc__"],
  ])("rejects %s", (_case, id) => {
    expect(isValidDocId(id)).toBe(false);
  });

  it("rejects an ID longer than 1,500 bytes", () => {
    expect(isValidDocId("a".repeat(1500))).toBe(true);
    expect(isValidDocId("a".repeat(1501))).toBe(false);
    // Bytes, not characters: 500 three-byte characters is exactly the limit.
    expect(isValidDocId("€".repeat(500))).toBe(true);
    expect(isValidDocId("€".repeat(501))).toBe(false);
  });

  it.each([[undefined], [null], [42], [["abc"]], [{ id: "abc" }]])(
    "rejects a non-string: %j",
    (value) => {
      expect(isValidDocId(value)).toBe(false);
    },
  );
});
