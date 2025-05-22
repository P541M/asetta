import Link from "next/link";

const footerLinks = {
  mainLinks: [
    { href: "/features", label: "Features" },
    { href: "/contact", label: "Contact" },
    { href: "/pricing", label: "Pricing?" },
  ],
  legalLinks: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-50 to-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Logo & Description */}
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center group">
              <span className="text-2xl font-extrabold text-primary-600 group-hover:text-primary-700 transition-colors tracking-tight">
                Asetta
              </span>
            </Link>
            <p className="text-base text-gray-600 max-w-md leading-relaxed">
              Asetta is your smart academic assistant. We help students stay
              organized, track assignments, and manage deadlines—all completely
              free. Join thousands of students who are achieving their academic
              goals with Asetta.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.linkedin.com/company/asetta/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-gray-500 hover:text-primary-600 transition-colors group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 group-hover:scale-110 transition-transform"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z" />
                </svg>
                <span className="ml-2 text-sm font-medium">LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Quick Links & Legal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {footerLinks.mainLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Legal
              </h4>
              <ul className="space-y-3">
                {footerLinks.legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="text-gray-500 text-sm text-center">
            © {new Date().getFullYear()} Asetta. All rights reserved. Made with
            ❤️ for students.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
