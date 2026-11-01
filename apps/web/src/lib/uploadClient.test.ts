import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  failedUpload,
  parseUploadResponse,
  pdfSelection,
  uploadLimitResetText,
  uploadOutcome,
  uploadQuotaFromPayload,
  type ParsedUploadResponse,
} from "./uploadClient";
import { MAX_FILE_BYTES, MAX_FILES_PER_UPLOAD } from "./upload/constants";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const html = (status: number) =>
  new Response("<!DOCTYPE html><html><body>Error</body></html>", {
    status,
    headers: { "content-type": "text/html" },
  });

describe("parseUploadResponse", () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes a successful JSON payload through", async () => {
    const payload = { success: true, message: "Extracted 3 assessments" };
    expect(await parseUploadResponse(json(payload))).toEqual({
      ok: true,
      status: 200,
      payload,
      errorMessage: null,
    });
  });

  it("treats success: false as a failure even with a 200", async () => {
    const result = await parseUploadResponse(json({ success: false, message: "No text found" }));
    expect(result).toMatchObject({ ok: false, status: 200, errorMessage: "No text found" });
  });

  it("prefers the message, then the error, then a generic line", async () => {
    expect(
      (await parseUploadResponse(json({ message: "Quota reached", error: "QUOTA" }, 429)))
        .errorMessage,
    ).toBe("Quota reached");
    expect((await parseUploadResponse(json({ error: "Bad request" }, 400))).errorMessage).toBe(
      "Bad request",
    );
    expect((await parseUploadResponse(json({}, 500))).errorMessage).toBe(
      "Upload failed. Please try again.",
    );
  });

  it.each([
    [413, "too large"],
    [504, "timed out"],
    [408, "timed out"],
    [502, "temporarily unavailable"],
    [503, "temporarily unavailable"],
    [401, "session expired"],
    [403, "session expired"],
    [500, "Something went wrong"],
    [404, "unexpected response"],
  ])("explains a non-JSON %i (%s)", async (status, phrase) => {
    const result = await parseUploadResponse(html(status));
    expect(result.ok).toBe(false);
    expect(result.status).toBe(status);
    expect(result.payload).toBeNull();
    expect(result.errorMessage).toContain(phrase);
  });

  it("states the batch limit for a too-large upload", async () => {
    expect((await parseUploadResponse(html(413))).errorMessage).toContain("4.0 MB");
  });

  it("treats an empty body as non-JSON", async () => {
    const result = await parseUploadResponse(new Response("", { status: 200 }));
    expect(result).toMatchObject({ ok: false, payload: null });
  });

  it("logs a non-JSON failure with its status and content type", async () => {
    await parseUploadResponse(html(502));
    expect(consoleError).toHaveBeenCalledWith(
      "Upload failed with a non-JSON response",
      expect.objectContaining({ status: 502, contentType: "text/html" }),
    );
  });

  it("doesn't log a JSON response", async () => {
    await parseUploadResponse(json({ success: false, error: "Bad request" }, 400));
    expect(consoleError).not.toHaveBeenCalled();
  });
});

describe("uploadQuotaFromPayload", () => {
  // Absolute instants: the reset is now plus the server's seconds, the same in both zone runs
  const NOW = new Date(Date.UTC(2026, 9, 19, 14, 0));
  const userLimit = {
    success: false,
    error: "DAILY_QUOTA_EXCEEDED",
    quotaType: "user",
    remaining: 3,
    retryAfter: 36_000,
  };

  it("reads the account's limit: files left and the reset on this clock", () => {
    expect(uploadQuotaFromPayload(userLimit, NOW)).toEqual({
      remaining: 3,
      resetsAt: new Date(Date.UTC(2026, 9, 20, 0, 0)),
    });
  });

  it("leaves the reset out when the server gave no usable wait", () => {
    expect(uploadQuotaFromPayload({ ...userLimit, retryAfter: undefined }, NOW)).toEqual({
      remaining: 3,
      resetsAt: null,
    });
    expect(uploadQuotaFromPayload({ ...userLimit, retryAfter: -5 }, NOW)?.resetsAt).toBeNull();
  });

  it("reads a missing or odd count as none left", () => {
    expect(uploadQuotaFromPayload({ ...userLimit, remaining: undefined }, NOW)?.remaining).toBe(0);
    expect(uploadQuotaFromPayload({ ...userLimit, remaining: -1 }, NOW)?.remaining).toBe(0);
  });

  it("is null for Gemini's own limits and for no payload", () => {
    expect(uploadQuotaFromPayload({ ...userLimit, quotaType: "daily" }, NOW)).toBeNull();
    expect(uploadQuotaFromPayload({ ...userLimit, quotaType: "temporary" }, NOW)).toBeNull();
    expect(uploadQuotaFromPayload(null, NOW)).toBeNull();
  });
});

describe("uploadLimitResetText", () => {
  // Local wall-clock times: midnight UTC is the same evening in Toronto and the next morning in
  // Kolkata, so each case is built in the zone the run uses
  it("names the time when the reset falls later today", () => {
    expect(uploadLimitResetText(new Date(2026, 9, 19, 20, 0), new Date(2026, 9, 19, 11, 0))).toBe(
      "Resets at 8:00 PM",
    );
  });

  it("says tomorrow when the reset falls on the next local day", () => {
    expect(uploadLimitResetText(new Date(2026, 9, 20, 5, 30), new Date(2026, 9, 19, 21, 0))).toBe(
      "Resets tomorrow at 5:30 AM",
    );
  });

  it("falls back to midnight UTC without a reset time", () => {
    expect(uploadLimitResetText(null, new Date(2026, 9, 19, 11, 0))).toBe("Resets at midnight UTC");
  });
});

describe("pdfSelection", () => {
  const pdf = (name: string, size = 1000) => ({ name, size, type: "application/pdf" });
  const docx = (name: string) => ({
    name,
    size: 1000,
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  it("is null for an empty pick, which changes nothing", () => {
    expect(pdfSelection([])).toBeNull();
  });

  it("keeps the PDFs of a mixed pick", () => {
    const a = pdf("a.pdf");
    const b = pdf("b.pdf");
    expect(pdfSelection([a, docx("notes.docx"), b])).toEqual({ files: [a, b] });
  });

  it("refuses a pick with no PDF and keeps the list", () => {
    const result = pdfSelection([docx("notes.docx")]);
    expect(result).toMatchObject({ clearList: false });
    expect(result && "error" in result && result.error).toContain("PDF files only");
  });

  it("empties the list for a pick over the limits", () => {
    const tooMany = Array.from({ length: MAX_FILES_PER_UPLOAD + 1 }, (_, i) => pdf(`${i}.pdf`));
    expect(pdfSelection(tooMany)).toMatchObject({ clearList: true });
    const result = pdfSelection([pdf("big.pdf", MAX_FILE_BYTES + 1)]);
    expect(result).toMatchObject({ clearList: true });
    expect(result && "error" in result && result.error).toContain("big.pdf");
  });
});

describe("uploadOutcome", () => {
  const NOW = new Date(Date.UTC(2026, 9, 19, 14, 0));
  const answer = (
    status: number,
    payload: ParsedUploadResponse["payload"],
    errorMessage: string | null = null,
  ): ParsedUploadResponse => ({ ok: status === 200, status, payload, errorMessage });
  const data = { processedFiles: 1, totalAssessments: 4 };

  it("reads a success: the server's summary and the extraction", () => {
    expect(
      uploadOutcome(answer(200, { success: true, message: "Processed 1 file", data }), NOW),
    ).toEqual({ status: "success", message: "Processed 1 file", result: data });
  });

  it("reads a success without a summary or data as nothing extracted", () => {
    expect(uploadOutcome(answer(200, { success: true }), NOW)).toEqual({
      status: "success",
      message: "Upload complete.",
      result: { processedFiles: 0, totalAssessments: 0 },
    });
  });

  const userLimit = {
    success: false,
    error: "DAILY_QUOTA_EXCEEDED",
    message: "You can upload 2 more files today.",
    quotaType: "user",
    retryAfter: 36_000,
  };

  it("keeps Extract on when the account has files left today", () => {
    expect(uploadOutcome(answer(429, { ...userLimit, remaining: 2 }), NOW)).toEqual({
      status: "error",
      error: "You can upload 2 more files today.",
      limit: { quota: { remaining: 2, resetsAt: new Date(Date.UTC(2026, 9, 20, 0, 0)) } },
    });
  });

  it("stops at the account's limit when no files are left", () => {
    expect(uploadOutcome(answer(429, { ...userLimit, remaining: 0 }), NOW)).toMatchObject({
      status: "daily_quota_exceeded",
      limit: { quota: { remaining: 0 } },
    });
  });

  it("stops at Gemini's daily quota, with no account limit to show", () => {
    expect(
      uploadOutcome(answer(429, { error: "DAILY_QUOTA_EXCEEDED", quotaType: "daily" }), NOW),
    ).toEqual({
      status: "daily_quota_exceeded",
      error: "Daily processing limit reached",
      limit: { quota: null },
    });
  });

  it("waits out a rate limit for the server's seconds, or 120", () => {
    expect(
      uploadOutcome(
        answer(429, { error: "RATE_LIMITED", message: "Busy", retryAfter: 90 }, "Busy"),
        NOW,
      ),
    ).toEqual({ status: "rate_limited", error: "Busy", retryAfter: 90 });
    expect(uploadOutcome(answer(429, { error: "RATE_LIMITED" }), NOW)).toEqual({
      status: "rate_limited",
      error: "Servers are busy. Please wait and try again.",
      retryAfter: 120,
    });
  });

  it("shows the parsed message for any other failure", () => {
    expect(uploadOutcome(answer(429, { error: "OTHER" }, "OTHER"), NOW)).toEqual(
      failedUpload("OTHER"),
    );
    expect(
      uploadOutcome(answer(400, { error: "Semester not found" }, "Semester not found"), NOW),
    ).toEqual({ status: "error", error: "Semester not found" });
    expect(uploadOutcome(answer(504, null, "Processing took too long"), NOW)).toEqual(
      failedUpload("Processing took too long"),
    );
  });
});
