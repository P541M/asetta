import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href="/" className="inline-flex items-center group">
              <span className="text-2xl font-extrabold text-primary-600 group-hover:text-primary-700 transition-colors tracking-tight">
                Asetta
              </span>
            </Link>
          </motion.div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/features"
              className="text-gray-600 hover:text-primary-500 transition-colors duration-200 text-sm font-medium"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-gray-600 hover:text-primary-500 transition-colors duration-200 text-sm font-medium"
            >
              Pricing?
            </Link>
            <Link
              href="https://kivo-two.vercel.app/login"
              className="text-gray-600 hover:text-primary-500 transition-colors duration-200 text-sm font-medium"
            >
              Login
            </Link>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="https://kivo-two.vercel.app/register"
                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                Get Started
                <svg
                  className="w-4 h-4 ml-2"
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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-600 hover:text-primary-500 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
