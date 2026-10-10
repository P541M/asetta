import Link from "next/link";
import { FOOTER_LINK_GROUPS, LINKEDIN_URL } from "@/lib/site";
import Container from "./Container";
import Logo from "./Logo";
import { LinkedInIcon } from "./icons";

export default function Footer() {
  return (
    <footer className="bg-stone-50">
      <Container className="pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] pt-16 md:pt-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Logo href="/" />
            <p className="mt-6 text-sm leading-relaxed text-stone-500">
              Always ahead, never behind.
            </p>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Asetta on LinkedIn"
              className="mt-5 inline-block text-stone-400 transition-colors duration-150 hover:text-stone-900"
            >
              <LinkedInIcon />
            </a>
          </div>

          {FOOTER_LINK_GROUPS.map((group) => (
            <div key={group.heading}>
              <h4 className="text-sm font-semibold text-stone-900">{group.heading}</h4>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-stone-500 transition-colors duration-150 hover:text-stone-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-sm text-stone-500">
            © {new Date().getFullYear()} Asetta. All rights reserved.
          </p>
          <p className="text-sm text-stone-500">Ontario, Canada</p>
        </div>
      </Container>
    </footer>
  );
}
