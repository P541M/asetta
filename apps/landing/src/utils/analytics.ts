// Google Analytics utility functions

declare global {
  interface Window {
    gtag: (command: string, action: string, parameters?: any) => void;
  }
}

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track contact form submission
export const trackContactFormSubmission = (success: boolean) => {
  trackEvent(
    success ? 'contact_form_success' : 'contact_form_error',
    'engagement',
    success ? 'Contact form submitted successfully' : 'Contact form submission failed'
  );
};

// Track CTA clicks
export const trackCTAClick = (buttonName: string, destination: string) => {
  trackEvent('cta_click', 'navigation', `${buttonName} -> ${destination}`);
};

// Track page views manually (for SPA routing)
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      page_path: url,
      page_title: title,
    });
  }
};