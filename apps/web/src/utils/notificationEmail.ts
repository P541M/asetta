import { isValidEmail } from "./validation";

/**
 * Where reminders go (A17). The user doc's `email` is the address the student picks, and any
 * client can write it, so it gets reminders only once it is safe to send to: the account's own
 * email, or an address whose owner used the confirm link (`verifiedEmail`, which only the server
 * writes). Until then reminders go to the account email.
 */

/** A saved address trimmed, or null when it doesn't look like an email address. */
export function cleanEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return isValidEmail(trimmed) ? trimmed : null;
}

/** Whether two values name the same address, ignoring case and surrounding spaces. */
export function sameAddress(a: unknown, b: unknown): boolean {
  const first = typeof a === "string" ? a.trim().toLowerCase() : "";
  const second = typeof b === "string" ? b.trim().toLowerCase() : "";
  return first !== "" && first === second;
}

export type NotificationEmailStatus = "account" | "confirmed" | "unconfirmed";

interface Addresses {
  /** The address the student chose (`email` on the user doc). */
  email: unknown;
  /** The address the student confirmed through the link (`verifiedEmail`, server-written). */
  verifiedEmail: unknown;
  /** The account's sign-in email. */
  accountEmail: string | null | undefined;
}

/**
 * How the chosen address stands: the account's own email, confirmed, or not confirmed yet.
 * Null when no usable address is chosen.
 */
export function notificationEmailStatus({
  email,
  verifiedEmail,
  accountEmail,
}: Addresses): NotificationEmailStatus | null {
  const chosen = cleanEmail(email);
  if (!chosen) return null;
  if (sameAddress(chosen, accountEmail)) return "account";
  return sameAddress(chosen, verifiedEmail) ? "confirmed" : "unconfirmed";
}

/** The address a reminder goes to, or null when there is none to send to. */
export function reminderRecipient(addresses: Addresses): string | null {
  const status = notificationEmailStatus(addresses);
  return status === "account" || status === "confirmed"
    ? cleanEmail(addresses.email)
    : cleanEmail(addresses.accountEmail);
}
