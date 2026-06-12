// Google Analytics helpers. The gtag global is injected by
// @next/third-parties' <GoogleAnalytics /> in _app.tsx.

declare global {
  interface Window {
    gtag?: (command: string, targetIdOrAction: string, params?: Record<string, unknown>) => void;
  }
}

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value,
    });
  }
};

export const trackContactFormSubmission = (success: boolean) => {
  trackEvent(
    success ? "contact_form_success" : "contact_form_error",
    "engagement",
    success ? "Contact form submitted successfully" : "Contact form submission failed",
  );
};

export const trackCTAClick = (buttonName: string, destination: string) => {
  trackEvent("cta_click", "navigation", `${buttonName} -> ${destination}`);
};
