import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { minimalPdf } from "@/test/pdf";
import { pdfText } from "./pdfText";

const outline = (code: string) =>
  minimalPdf([`${code} Course Outline`, "Midterm Exam: November 12"]);

describe("pdfText", () => {
  it('A44: reads a PDF under 4 KB (pdf-parse failed with "bad XRef entry")', async () => {
    expect(await pdfText(outline("CIS 3760"))).toContain("CIS 3760 Course Outline");
  });

  it("A44: reads each PDF of a shared buffer as itself, not as the bytes around it", async () => {
    const first = outline("CIS 3760");
    const second = outline("MATH 2050");
    // The layout Node gives small files read from disk: slices of one shared buffer
    const shared = Buffer.alloc(first.length + second.length);
    first.copy(shared, 0);
    second.copy(shared, first.length);

    const secondText = await pdfText(shared.subarray(first.length));
    expect(secondText).toContain("MATH 2050");
    expect(secondText).not.toContain("CIS 3760");
    const firstText = await pdfText(shared.subarray(0, first.length));
    expect(firstText).toContain("CIS 3760");
    expect(firstText).not.toContain("MATH 2050");
  });

  describe("small files read back to back, as the upload route reads them", () => {
    let dir = "";
    beforeAll(() => {
      dir = fs.mkdtempSync(path.join(os.tmpdir(), "asetta-pdftext-"));
    });
    afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

    it("A44: reads each one as itself", async () => {
      const codes = ["CIS 3760", "MATH 2050", "HIST 1010"];
      codes.forEach((code, i) => fs.writeFileSync(path.join(dir, `${i}.pdf`), outline(code)));
      for (const [i, code] of codes.entries()) {
        const text = await pdfText(fs.readFileSync(path.join(dir, `${i}.pdf`)));
        expect(text).toContain(code);
        for (const other of codes.filter((c) => c !== code)) expect(text).not.toContain(other);
      }
    });
  });
});
