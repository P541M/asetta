import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle scroll events to add shadow and background change
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  // Handle clicking outside to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Close mobile menu when pressing Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileMenuOpen]);

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`fixed w-full top-0 z-50 transition-all duration-500 pt-safe-only ${
        scrolled
          ? "bg-light-bg-primary/90 backdrop-blur-xl shadow-lg border-b border-light-border-primary/50"
          : "bg-light-bg-primary/70 backdrop-blur-md border-b border-light-bg-primary/20"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pl-safe pr-safe">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Logo
              size="sm"
              variant="logo-with-text"
              color="primary"
              href="/"
              className="group"
            />
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className="relative px-4 py-2 text-light-text-secondary hover:text-primary-600 transition-all duration-300 text-sm font-semibold rounded-lg hover:bg-light-hover-primary/80 group"
            >
              Home
              <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary-600 group-hover:w-1/2 group-hover:left-1/4 transition-all duration-300"></div>
            </Link>
            <Link
              href="/features"
              className="relative px-4 py-2 text-light-text-secondary hover:text-primary-600 transition-all duration-300 text-sm font-semibold rounded-lg hover:bg-light-hover-primary/80 group"
            >
              Features
              <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary-600 group-hover:w-1/2 group-hover:left-1/4 transition-all duration-300"></div>
            </Link>
            <Link
              href="/pricing"
              className="relative px-4 py-2 text-light-text-secondary hover:text-primary-600 transition-all duration-300 text-sm font-semibold rounded-lg hover:bg-light-hover-primary/80 group"
            >
              Pricing
              <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary-600 group-hover:w-1/2 group-hover:left-1/4 transition-all duration-300"></div>
            </Link>
            <Link
              href="/about"
              className="relative px-4 py-2 text-light-text-secondary hover:text-primary-600 transition-all duration-300 text-sm font-semibold rounded-lg hover:bg-light-hover-primary/80 group"
            >
              About
              <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary-600 group-hover:w-1/2 group-hover:left-1/4 transition-all duration-300"></div>
            </Link>
            <Link
              href="/story"
              className="relative px-4 py-2 text-light-text-secondary hover:text-primary-600 transition-all duration-300 text-sm font-semibold rounded-lg hover:bg-light-hover-primary/80 group"
            >
              Our Story
              <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary-600 group-hover:w-1/2 group-hover:left-1/4 transition-all duration-300"></div>
            </Link>
            <Link
              href="/contact"
              className="relative px-4 py-2 text-light-text-secondary hover:text-primary-600 transition-all duration-300 text-sm font-semibold rounded-lg hover:bg-light-hover-primary/80 group"
            >
              Contact
              <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary-600 group-hover:w-1/2 group-hover:left-1/4 transition-all duration-300"></div>
            </Link>

            <div className="h-6 w-px bg-light-border-primary mx-3"></div>

            <Link
              href="https://asetta.me/login"
              className="px-4 py-2 text-light-text-secondary hover:text-primary-600 transition-all duration-300 text-sm font-semibold rounded-lg hover:bg-light-hover-primary"
            >
              Login
            </Link>

            <motion.div
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="ml-2"
            >
              <Link
                href="https://asetta.me/register"
                className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10">Get Started</span>
                <svg
                  className="w-4 h-4 ml-2 relative z-10 group-hover:translate-x-0.5 transition-transform duration-300"
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
            </motion.div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden" ref={menuRef}>
            <motion.button
              type="button"
              className={`relative p-3 rounded-xl transition-all duration-300 ${
                mobileMenuOpen
                  ? "bg-light-hover-primary text-primary-600 shadow-md"
                  : "text-light-text-secondary hover:text-primary-600 hover:bg-light-hover-primary/50"
              }`}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              <motion.svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                stroke="currentColor"
                animate={{ rotate: mobileMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {mobileMenuOpen ? (
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3 }}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <motion.g
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path d="M4 6h16" />
                    <path d="M4 12h16" />
                    <path d="M4 18h16" />
                  </motion.g>
                )}
              </motion.svg>
            </motion.button>

            {/* Enhanced Mobile Menu Dropdown */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute top-full left-0 right-0 mt-3 mx-4 bg-light-bg-primary/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-light-border-primary/50 py-6 z-50"
                >
                  <div className="flex flex-col space-y-2 px-4">
                    <Link
                      href="/"
                      className="group flex items-center px-4 py-3.5 text-light-text-secondary hover:text-primary-600 hover:bg-light-hover-primary/80 rounded-xl transition-all duration-300 text-base font-semibold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        Home
                      </span>
                    </Link>
                    <Link
                      href="/features"
                      className="group flex items-center px-4 py-3.5 text-light-text-secondary hover:text-primary-600 hover:bg-light-hover-primary/80 rounded-xl transition-all duration-300 text-base font-semibold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        Features
                      </span>
                    </Link>
                    <Link
                      href="/pricing"
                      className="group flex items-center px-4 py-3.5 text-light-text-secondary hover:text-primary-600 hover:bg-light-hover-primary/80 rounded-xl transition-all duration-300 text-base font-semibold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        Pricing
                      </span>
                    </Link>
                    <Link
                      href="/about"
                      className="group flex items-center px-4 py-3.5 text-light-text-secondary hover:text-primary-600 hover:bg-light-hover-primary/80 rounded-xl transition-all duration-300 text-base font-semibold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        About
                      </span>
                    </Link>
                    <Link
                      href="/story"
                      className="group flex items-center px-4 py-3.5 text-light-text-secondary hover:text-primary-600 hover:bg-light-hover-primary/80 rounded-xl transition-all duration-300 text-base font-semibold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        Our Story
                      </span>
                    </Link>
                    <Link
                      href="/contact"
                      className="group flex items-center px-4 py-3.5 text-light-text-secondary hover:text-primary-600 hover:bg-light-hover-primary/80 rounded-xl transition-all duration-300 text-base font-semibold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        Contact
                      </span>
                    </Link>

                    <div className="h-px bg-gradient-to-r from-transparent via-light-border-primary to-transparent my-4" />

                    <Link
                      href="https://asetta.me/login"
                      className="group flex items-center px-4 py-3.5 text-light-text-secondary hover:text-primary-600 hover:bg-light-hover-primary/80 rounded-xl transition-all duration-300 text-base font-semibold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        Login
                      </span>
                    </Link>

                    <motion.div className="pt-2" whileTap={{ scale: 0.98 }}>
                      <Link
                        href="https://asetta.me/register"
                        className="group relative flex items-center justify-center mx-2 px-6 py-4 text-base font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        <span className="relative z-10">Get Started</span>
                        <svg
                          className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform duration-300"
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
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
