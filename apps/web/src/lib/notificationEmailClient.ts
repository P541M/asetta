import { User } from "firebase/auth";

/**
 * The client side of the notification-address confirm link (A17): asking for the link, and
 * using it on the confirm page. The server routes are `pages/api/notification-email/`.
 */

/** "sent": the link is on its way; "not-needed": the saved address needs no link; "wait": capped. */
export type ConfirmLinkRequest = "sent" | "not-needed" | "wait" | "failed";

/** Asks the server to email the confirm link to the notification address saved on the user doc. */
export async function requestConfirmLink(user: User): Promise<ConfirmLinkRequest> {
  try {
    const token = await user.getIdToken();
    const response = await fetch("/api/notification-email/verify", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 429) return "wait";
    if (!response.ok) return "failed";
    const body: unknown = await response.json();
    const sent = typeof body === "object" && body !== null && "sent" in body && body.sent === true;
    return sent ? "sent" : "not-needed";
  } catch {
    return "failed";
  }
}

export type ConfirmAddressResult = "confirmed" | "invalid" | "expired" | "failed";

/** Confirms the address with the link's uid and token (the confirm page's button). */
export async function confirmAddress(uid: string, token: string): Promise<ConfirmAddressResult> {
  try {
    const response = await fetch("/api/notification-email/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, token }),
    });
    const body: unknown = await response.json().catch(() => null);
    const status =
      typeof body === "object" && body !== null && "status" in body ? body.status : null;
    return status === "confirmed" || status === "invalid" || status === "expired"
      ? status
      : "failed";
  } catch {
    return "failed";
  }
}
