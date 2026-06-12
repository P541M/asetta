// Single source of truth for site-wide URLs, navigation, and metadata.

export const APP_URL = "https://asetta.me";
export const REGISTER_URL = `${APP_URL}/register`;
export const LOGIN_URL = `${APP_URL}/login`;

export const CONTACT_EMAIL = "videna.psalmeleazar@gmail.com";
export const LINKEDIN_URL = "https://www.linkedin.com/company/asetta/";

export interface NavLink {
  href: string;
  label: string;
}

// Center nav links. "Home" is intentionally absent; the logo links home.
export const NAV_LINKS: NavLink[] = [
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const FOOTER_LINK_GROUPS: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: LOGIN_URL, label: "Login" },
      { href: REGISTER_URL, label: "Get started" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];
