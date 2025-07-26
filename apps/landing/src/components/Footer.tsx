import Link from "next/link";
import Logo from "./Logo";

const footerLinks = {
  productLinks: [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/contact", label: "Contact" },
  ],
  companyLinks: [
    { href: "/about", label: "About" },
    { href: "/story", label: "Our Story" },
    { href: "/founders-note", label: "Founder's Note" },
  ],
  legalLinks: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

const Footer = () => {
  return (
    <>
      <footer className="relative bg-gradient-to-br from-gray-50/80 via-white to-primary-50/30 border-t border-gray-200/30 pt-24 pb-12 pb-safe overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-primary-100/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-gradient-to-tr from-primary-100/15 to-transparent rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary-50/10 via-transparent to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 mb-16">
            {/* Brand Section */}
            <div className="lg:col-span-1 space-y-8">
              <div className="space-y-6">
                <Logo
                  size="md"
                  variant="logo-with-text"
                  color="primary"
                  href="/"
                  className="group"
                />

                <p className="text-gray-600 leading-relaxed text-lg max-w-sm">
                  Always ahead, never behind. Your smart academic assistant
                  helping students stay organized and achieve their
                  goals—completely free.
                </p>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Connect With Us
                </h4>
                <div className="flex space-x-4">
                  <a
                    href="https://www.linkedin.com/company/asetta/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center w-12 h-12 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-white hover:border-blue-600 hover:bg-blue-600 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="group-hover:scale-110 transition-transform duration-300"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-12">
              {/* Product Links */}
              <div className="space-y-6">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Product
                </h4>
                <ul className="space-y-4">
                  {footerLinks.productLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group relative text-gray-600 hover:text-primary-600 transition-all duration-300 text-base font-medium"
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">
                          {link.label}
                        </span>
                        <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company Links */}
              <div className="space-y-6">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Company
                </h4>
                <ul className="space-y-4">
                  {footerLinks.companyLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group relative text-gray-600 hover:text-primary-600 transition-all duration-300 text-base font-medium"
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">
                          {link.label}
                        </span>
                        <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal Links */}
              <div className="space-y-6">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Legal
                </h4>
                <ul className="space-y-4">
                  {footerLinks.legalLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group relative text-gray-600 hover:text-primary-600 transition-all duration-300 text-base font-medium"
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">
                          {link.label}
                        </span>
                        <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Section */}
              <div className="space-y-6">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Get Started
                </h4>
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Ready to boost your academic productivity?
                  </p>
                  <Link
                    href="https://asetta.me/register"
                    className="group inline-flex items-center px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <span className="relative z-10">Start Free</span>
                    <svg
                      className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-300/50 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              {/* Copyright */}
              <div className="text-gray-500 text-sm font-medium">
                © {new Date().getFullYear()} Asetta. All rights reserved.
              </div>

              {/* Made with love */}
              <div className="flex items-center text-sm text-gray-500 font-medium">
                <span>Made with</span>
                <span className="mx-2 text-red-500 animate-pulse text-base">
                  ❤️
                </span>
                <span>for students</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Safe area background extension for footer */}
      <div
        className="bg-gradient-to-br from-gray-50/80 via-white to-primary-50/30"
        style={{
          height: `max(0px, env(safe-area-inset-bottom))`,
        }}
      />
    </>
  );
};

export default Footer;
