/**
 * Outgoing email: one shared layout plus one builder per email. A builder returns the subject,
 * HTML and plain-text parts together, so the dev preview route renders exactly what is sent.
 *
 * Mail clients are not browsers. Layout is tables, and the light theme is inline styles because
 * some clients strip <style>; the <style> block only adds the dark theme for clients that honor
 * prefers-color-scheme (Apple Mail). Colors are the platform's theme tokens (standards.md).
 * Every user value is escaped before it reaches the HTML.
 */

import { calendarDaysUntil } from "../utils/dateUtils";
import { escapeHtml } from "../utils/escapeHtml";

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export interface ReminderDetails {
  assessmentTitle: string;
  courseName: string;
  /**
   * Parsed on the server's clock (lib/notifications.ts) and formatted on the same clock, so the
   * due time the student entered comes back unchanged. The "due in" wording counts calendar days
   * to it on that clock too, so it always agrees with the date shown. Per-user time zones arrive
   * with A8.
   */
  dueAt: Date;
}

const DEFAULT_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://asetta.me";

// --card, --secondary/50 on card (the assessment-row tone), --foreground, --muted-foreground,
// --primary, --primary-foreground
const LIGHT = {
  surface: "#FFFFFF",
  panel: "#F8F7F6",
  text: "#1A1A1A",
  muted: "#6B6B6B",
  primary: "#D97706",
  onPrimary: "#FFFFFF",
};
const DARK = {
  surface: "#1E1E1E",
  panel: "#242424",
  text: "#F5F5F4",
  muted: "#A6A6A6",
  primary: "#F59E0B",
  onPrimary: "#1A1A1A",
};

// Manrope loads where the client allows web fonts (Apple Mail, iOS Mail); Gmail and Outlook never
// load them and fall back to the system stack.
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700&display=swap";
const FONT =
  "Manrope, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

// The platform's type ramp: section heading, item title, body, caption.
const HEADING = `margin:0;font-family:${FONT};font-size:20px;line-height:28px;font-weight:600;letter-spacing:-0.5px;color:${LIGHT.text};`;
const TITLE = `margin:0;font-family:${FONT};font-size:16px;line-height:24px;font-weight:600;color:${LIGHT.text};`;
const BODY = `font-family:${FONT};font-size:14px;line-height:22px;color:${LIGHT.text};`;
const BODY_MUTED = `font-family:${FONT};font-size:14px;line-height:22px;color:${LIGHT.muted};`;
const CAPTION = `margin:0;font-family:${FONT};font-size:12px;line-height:18px;color:${LIGHT.muted};`;

/** Collapses whitespace so stored text can't break a subject line or the layout. */
const oneLine = (value: string): string => value.replace(/\s+/g, " ").trim();

/** "today", "tomorrow" or "in N days": the subject and the heading say it the same way. */
function dueInWords(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

/** "Thursday, October 15 at 11:59 PM", on the server's clock (see ReminderDetails.dueAt). */
function formatDue(dueAt: Date): string {
  const date = dueAt.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  // ICU puts a narrow no-break space before AM/PM, which some mail clients render as a box.
  const time = dueAt
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .replace(/ /g, " ");
  return `${date} at ${time}`;
}

/**
 * The app's `Logo`: the amber mark beside a live-text wordmark. The app's font-extrabold renders
 * at 700, the heaviest Manrope weight it loads, so 700 here matches it (and falls back to Bold).
 */
function logo(appUrl: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="padding-right:12px;vertical-align:middle;"><img src="${escapeHtml(appUrl)}/images/email-logo.png" width="28" height="28" alt="" style="display:block;border:0;"></td>
<td class="fg" style="vertical-align:middle;font-family:${FONT};font-size:20px;line-height:28px;font-weight:700;letter-spacing:-0.5px;color:${LIGHT.text};">Asetta</td>
</tr></table>`;
}

/** The platform's primary button at its `sm` size: 36px tall, text-sm font-medium, rounded-lg. */
function button(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td class="button" bgcolor="${LIGHT.primary}" style="border-radius:8px;background-color:${LIGHT.primary};"><a href="${escapeHtml(href)}" style="display:inline-block;padding:8px 14px;font-family:${FONT};font-size:14px;line-height:20px;font-weight:500;color:${LIGHT.onPrimary};text-decoration:none;border-radius:8px;">${label}</a></td>
</tr></table>`;
}

function footerLink(label: string, href: string): string {
  return `<a href="${escapeHtml(href)}" class="muted" style="color:${LIGHT.muted};text-decoration:underline;">${label}</a>`;
}

interface Layout {
  appUrl: string;
  title: string;
  /** The inbox preview line. Plain text. */
  preheader: string;
  /** Table rows for the main column. Already escaped. */
  content: string;
  /** The footer caption. Already escaped. */
  footer: string;
}

function renderLayout({ appUrl, title, preheader, content, footer }: Layout): string {
  // Filler after the preheader keeps clients from pulling body text into the inbox preview.
  const previewFiller = "&#847;&zwnj;&nbsp;".repeat(40);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
<title>${escapeHtml(title)}</title>
<!--[if !mso]><!--><link href="${FONT_LINK}" rel="stylesheet"><!--<![endif]-->
<!--[if mso]><style>* { font-family: Arial, sans-serif !important; }</style><![endif]-->
<style>
:root { color-scheme: light dark; supported-color-schemes: light dark; }
a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
@media (prefers-color-scheme: dark) {
  .surface { background-color: ${DARK.surface} !important; }
  .panel { background-color: ${DARK.panel} !important; }
  .fg { color: ${DARK.text} !important; }
  .muted { color: ${DARK.muted} !important; }
  .button { background-color: ${DARK.primary} !important; }
  .button a { color: ${DARK.onPrimary} !important; }
}
</style>
</head>
<body class="surface" style="margin:0;padding:0;background-color:${LIGHT.surface};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(preheader)}${previewFiller}</div>
<table role="presentation" class="surface" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${LIGHT.surface};">
<tr><td align="center" style="padding:40px 24px;">
<!--[if mso]><table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
<tr><td style="padding-bottom:32px;">${logo(appUrl)}</td></tr>
${content}
<tr><td style="padding-top:40px;"><p class="muted" style="${CAPTION}">${footer}</p></td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;
}

export function reminderEmail(details: ReminderDetails, appUrl = DEFAULT_APP_URL): EmailContent {
  const title = oneLine(details.assessmentTitle);
  const course = oneLine(details.courseName);
  const dueIn = dueInWords(calendarDaysUntil(details.dueAt));
  const due = formatDue(details.dueAt);
  const heading = `Due ${dueIn}`;
  const subject = course ? `${title} for ${course} is due ${dueIn}` : `${title} is due ${dueIn}`;
  const dashboardUrl = `${appUrl}/dashboard`;
  const settingsUrl = `${appUrl}/settings`;
  const footerText = "You're getting this because email reminders are on for your Asetta account.";

  const content = `<tr><td style="padding-bottom:16px;"><h1 class="fg" style="${HEADING}">${heading}</h1></td></tr>
<tr><td class="panel" style="padding:20px;border-radius:16px;background-color:${LIGHT.panel};">
<p class="fg" style="${TITLE}">${escapeHtml(title)}</p>
${course ? `<p class="muted" style="margin:0;${BODY_MUTED}">${escapeHtml(course)}</p>\n` : ""}<p class="fg" style="margin:8px 0 0 0;${BODY}">${escapeHtml(due)}</p>
</td></tr>
<tr><td style="padding-top:24px;">${button("Open Asetta", dashboardUrl)}</td></tr>`;

  const html = renderLayout({
    appUrl,
    title: subject,
    preheader: `Due ${due}.`,
    content,
    footer: `${escapeHtml(footerText)}<br>${footerLink("Manage reminders in Settings", settingsUrl)}`,
  });

  const text = [
    heading,
    [title, course, due].filter(Boolean).join("\n"),
    `Open Asetta: ${dashboardUrl}`,
    `${footerText}\nManage reminders in Settings: ${settingsUrl}`,
  ].join("\n\n");

  return { subject, html, text };
}

/** Pass `name` only for a verified address (D7); without it the email greets "Hi there". */
export function welcomeEmail(name?: string, appUrl = DEFAULT_APP_URL): EmailContent {
  const cleanName = name ? oneLine(name) : "";
  const heading = "Welcome to Asetta";
  const subject = cleanName ? `Welcome to Asetta, ${cleanName}` : heading;
  const greeting = `Hi ${cleanName || "there"},`;
  const paragraphs = [
    "Your account is ready. Asetta keeps your assessments, due dates and grades in one place, for every course.",
    "To get started, upload a course outline and Asetta will add its assessments and due dates for you.",
  ];
  const dashboardUrl = `${appUrl}/dashboard`;
  const footer = "You're getting this email because you created an Asetta account.";

  const content = `<tr><td style="padding-bottom:16px;"><h1 class="fg" style="${HEADING}">${heading}</h1></td></tr>
<tr><td>
<p class="fg" style="margin:0;${BODY}">${escapeHtml(greeting)}</p>
${paragraphs.map((line) => `<p class="fg" style="margin:16px 0 0 0;${BODY}">${line}</p>`).join("\n")}
</td></tr>
<tr><td style="padding-top:24px;">${button("Open Asetta", dashboardUrl)}</td></tr>`;

  const html = renderLayout({
    appUrl,
    title: subject,
    preheader: "Your account is ready.",
    content,
    footer: escapeHtml(footer),
  });

  const text = [heading, greeting, ...paragraphs, `Open Asetta: ${dashboardUrl}`, footer].join(
    "\n\n",
  );

  return { subject, html, text };
}
