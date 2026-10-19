import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// nodemailer is replaced by fake transports, so nothing here opens a connection.
const { transports } = vi.hoisted(() => ({
  transports: [] as {
    options: Record<string, unknown>;
    verify: ReturnType<typeof vi.fn>;
    sendMail: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
  }[],
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: (options: Record<string, unknown>) => {
      const transport = {
        options,
        verify: vi.fn(async () => true),
        sendMail: vi.fn(async () => ({})),
        close: vi.fn(),
      };
      transports.push(transport);
      return transport;
    },
  },
}));

const { createReminderMailer, sendWelcomeEmail } = await import("./email");

const details = {
  assessmentTitle: "Lab 4",
  courseName: "CIS 3760",
  dueDate: "2026-10-21",
  dueTime: "23:59",
  daysUntilDue: 2,
};

/** The transport the latest `createReminderMailer()` made. */
const latestPool = () => transports[transports.length - 1];

beforeEach(() => {
  vi.stubEnv("EMAIL_USER", "sender@example.test");
  vi.stubEnv("EMAIL_APP_PASSWORD", "app-password");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("createReminderMailer", () => {
  it("A19: verifies the Gmail login once for all of a run's emails", async () => {
    const mailer = createReminderMailer();
    const pool = latestPool();
    await Promise.all([
      mailer.send("a@example.test", details),
      mailer.send("b@example.test", details),
    ]);
    await mailer.send("c@example.test", details);

    expect(pool.verify).toHaveBeenCalledTimes(1);
    expect(pool.sendMail).toHaveBeenCalledTimes(3);
    expect(pool.sendMail).toHaveBeenLastCalledWith(
      expect.objectContaining({ to: "c@example.test", from: '"Asetta" <sender@example.test>' }),
    );
  });

  it("A19: sends over a few pooled Gmail connections, closed at the end of the run", () => {
    const mailer = createReminderMailer();
    const pool = latestPool();
    expect(pool.options).toMatchObject({ service: "gmail", pool: true, maxConnections: 3 });
    mailer.close();
    expect(pool.close).toHaveBeenCalledTimes(1);
  });

  it("A19: checks the login again after a failed check, and that send fails", async () => {
    const mailer = createReminderMailer();
    const pool = latestPool();
    pool.verify.mockRejectedValueOnce(new Error("Invalid login"));

    await expect(mailer.send("a@example.test", details)).rejects.toThrow("Invalid login");
    await mailer.send("b@example.test", details);
    await mailer.send("c@example.test", details);

    expect(pool.verify).toHaveBeenCalledTimes(2);
    expect(pool.sendMail).toHaveBeenCalledTimes(2);
  });

  it("fails before connecting when the Gmail settings are missing", async () => {
    vi.stubEnv("EMAIL_APP_PASSWORD", "");
    const mailer = createReminderMailer();
    const pool = latestPool();
    await expect(mailer.send("a@example.test", details)).rejects.toThrow("EMAIL_APP_PASSWORD");
    expect(pool.verify).not.toHaveBeenCalled();
    expect(pool.sendMail).not.toHaveBeenCalled();
  });
});

describe("one email per request", () => {
  it("verifies the login before each welcome email", async () => {
    // The only transport that isn't a pool: the module's own, made when it loaded
    const oneOff = transports.filter((transport) => !transport.options.pool);
    expect(oneOff).toHaveLength(1);
    const [transporter] = oneOff;
    transporter.verify.mockClear();
    transporter.sendMail.mockClear();
    await sendWelcomeEmail("a@example.test");
    await sendWelcomeEmail("b@example.test");
    expect(transporter.verify).toHaveBeenCalledTimes(2);
    expect(transporter.sendMail).toHaveBeenCalledTimes(2);
  });
});
