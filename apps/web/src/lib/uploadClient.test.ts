import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parseUploadResponse, uploadLimitResetText, uploadQuotaFromPayload } from "./uploadClient";

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
