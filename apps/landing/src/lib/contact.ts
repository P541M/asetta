// Contract for the contact form POST body, shared by the contact page
// and the /api/contact route so the two sides cannot drift apart.
export interface ContactFormPayload {
  name: string;
  email: string;
  message: string;
  emailConsent: boolean;
  /** The honeypot (A20): hidden from people, so only a bot fills it. Always empty from the page. */
  website: string;
}
