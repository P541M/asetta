import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { NAV_LINKS, LOGIN_URL, REGISTER_URL } from "@/lib/site";
import { trackCTAClick } from "@/utils/analytics";
import Logo from "./Logo";
import ButtonLink from "./Button";
import { CloseIcon, MenuIcon } from "./icons";

const NAV_LINK_VARIANTS = {
  desktop: "rounded-md px-3 py-1.5 text-sm",
  mobile: "rounded-lg px-3 py-2.5 text-base",
} as const;

/** Nav-link styling shared by the desktop bar and the mobile dropdown. */
const navLinkClasses = (active: boolean, variant: keyof typeof NAV_LINK_VARIANTS = "desktop") =>
  cn(
    NAV_LINK_VARIANTS[variant],
    "transition-colors duration-150",
    active
      ? "font-semibold text-stone-900"
      : "font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900",
  );

export default function Header() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => router.pathname.startsWith(href);

  // Show the bottom hairline once the page is scrolled.
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the mobile menu on outside click or Escape.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={cn(
        "pt-safe-only fixed inset-x-0 top-0 z-50 bg-white/85 backdrop-blur-md transition-shadow duration-200",
        scrolled && "shadow-[0_1px_12px_rgb(28_25_23/0.08)]",
      )}
    >
      {/* Three-zone layout: logo far left, page nav centered, auth far right */}
      <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center px-6 lg:px-8">
        <div className="col-start-1 flex justify-start">
          <Logo href="/" />
        </div>

        {/* Centered page navigation */}
        <nav className="col-start-2 hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={navLinkClasses(isActive(link.href))}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth actions, far right */}
        <div className="col-start-3 row-start-1 hidden items-center justify-end gap-1 md:flex">
          <Link
            href={LOGIN_URL}
            onClick={() => trackCTAClick("Login - Header", LOGIN_URL)}
            className={navLinkClasses(false)}
          >
            Login
          </Link>
          <ButtonLink href={REGISTER_URL} trackLabel="Get Started - Header" className="ml-2">
            Get started
          </ButtonLink>
        </div>

        {/* Mobile menu */}
        <div className="col-start-3 row-start-1 flex justify-end md:hidden" ref={menuRef}>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded-md p-2 text-stone-600 transition-colors duration-150 hover:bg-stone-100 hover:text-stone-900"
          >
            {mobileMenuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                aria-label="Mobile"
                className="absolute inset-x-4 top-full mt-2 rounded-xl bg-white p-3 shadow-lg shadow-stone-900/10"
              >
                <div className="flex flex-col gap-0.5">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      className={navLinkClasses(isActive(link.href), "mobile")}
                    >
                      {link.label}
                    </Link>
                  ))}

                  <div className="my-2 h-px bg-stone-200" aria-hidden />

                  <Link
                    href={LOGIN_URL}
                    onClick={() => {
                      trackCTAClick("Login - Mobile Menu", LOGIN_URL);
                      setMobileMenuOpen(false);
                    }}
                    className={navLinkClasses(false, "mobile")}
                  >
                    Login
                  </Link>

                  <ButtonLink
                    href={REGISTER_URL}
                    size="lg"
                    withArrow
                    trackLabel="Get Started - Mobile Menu"
                    className="mt-1"
                  >
                    Get started
                  </ButtonLink>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
