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
    <footer className="bg-gradient-to-br from-gray-50 via-gray-25 to-white border-t border-gray-200/50 pt-20 pb-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary-50/20 via-transparent to-transparent"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Logo & Description */}
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center group">
              <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-700 group-hover:from-primary-700 group-hover:to-primary-800 transition-all duration-300 tracking-tight">
                Asetta
              </span>
            </Link>
            <p className="text-lg text-gray-700 max-w-md leading-relaxed font-medium">
              Asetta is your smart academic assistant. We help students stay
              organized, track assignments, and manage deadlines—all completely
              free. Join thousands of students who are achieving their academic
              goals with Asetta.
            </p>
            <div className="flex space-x-6">
              <a
                href="https://www.linkedin.com/company/asetta/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center px-4 py-2 text-gray-600 hover:text-primary-600 transition-all duration-300 hover:bg-primary-50 rounded-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-6 w-6 group-hover:scale-110 transition-transform duration-300"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z" />
                </svg>
                <span className="ml-3 text-sm font-semibold">LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Quick Links & Legal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-6">
                Quick Links
              </h4>
              <ul className="space-y-4">
                {footerLinks.mainLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-primary-600 transition-all duration-300 inline-flex items-center group font-medium text-base hover:bg-primary-50 px-2 py-1 rounded-lg -ml-2"
                    >
                      <span className="group-hover:translate-x-2 transition-transform duration-300">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-6">
                Legal
              </h4>
              <ul className="space-y-4">
                {footerLinks.legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-primary-600 transition-all duration-300 inline-flex items-center group font-medium text-base hover:bg-primary-50 px-2 py-1 rounded-lg -ml-2"
                    >
                      <span className="group-hover:translate-x-2 transition-transform duration-300">
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
        <div className="mt-16 pt-8 border-t border-gray-200/60">
          <div className="text-gray-600 text-base text-center font-medium">
            © {new Date().getFullYear()} Asetta. All rights reserved. Made with{" "}
            <span className="text-red-500 animate-pulse">❤️</span> for students.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
