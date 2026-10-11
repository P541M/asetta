import { describe, expect, it } from "vitest";
import { formatBytes, MAX_FILE_BYTES, validateUploadSelection } from "./constants";

const MB = 1024 * 1024;
const pdf = (name: string, size: number) => ({ name, size });

describe("formatBytes", () => {
  it.each([
    [512, "512 B"],
    [1024, "1 KB"],
    [1536, "2 KB"],
    [MB, "1.0 MB"],
    [4.25 * MB, "4.3 MB"],
  ])("formats %i as %s", (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected);
  });
});

describe("validateUploadSelection", () => {
  it("asks for a file when nothing is selected", () => {
    expect(validateUploadSelection([])).toBe("Please select at least one PDF.");
  });

  it("accepts files within every limit", () => {
    expect(validateUploadSelection([pdf("outline.pdf", 200_000)])).toBeNull();
    expect(validateUploadSelection([pdf("big.pdf", MAX_FILE_BYTES)])).toBeNull();
    expect(
      validateUploadSelection(Array.from({ length: 10 }, (_, i) => pdf(`${i}.pdf`, 1000))),
    ).toBeNull();
  });

  it("rejects more than 10 files and says how many to remove", () => {
    const message = validateUploadSelection(
      Array.from({ length: 12 }, (_, i) => pdf(`${i}.pdf`, 1000)),
    );
    expect(message).toContain("up to 10 files");
    expect(message).toContain("remove 2");
  });

  it("checks the count before the sizes", () => {
    const files = Array.from({ length: 11 }, (_, i) => pdf(`${i}.pdf`, 5 * MB));
    expect(validateUploadSelection(files)).toContain("up to 10 files");
  });

  it("names a file over 4 MB", () => {
    const message = validateUploadSelection([pdf("ok.pdf", 1000), pdf("scan.pdf", 4.1 * MB)]);
    expect(message).toContain('"scan.pdf" is 4.1 MB');
    expect(message).toContain("4.0 MB per file");
  });

  it("rejects files that are each fine but total over 4 MB", () => {
    const message = validateUploadSelection([pdf("a.pdf", 2.2 * MB), pdf("b.pdf", 2.2 * MB)]);
    expect(message).toContain("Those 2 files total 4.4 MB");
    expect(message).toContain("4.0 MB per upload");
  });
});
