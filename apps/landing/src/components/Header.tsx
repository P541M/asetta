import Link from "next/link";
import { useState, useEffect } from "react";

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
    <header
      className={`bg-white border-b border-gray-100 sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "shadow-md backdrop-blur-sm bg-white/95"
          : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-indigo-600 transition-transform duration-300 group-hover:scale-110"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              <span className="ml-2 text-xl font-bold text-indigo-600 transition-colors duration-300 group-hover:text-indigo-700 font-heading tracking-wide">
                Kivo
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Link
                href="https://kivo-two.vercel.app/login"
                className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="https://kivo-two.vercel.app/register"
                className="btn-primary text-sm px-4 py-2 shadow-sm hover:shadow transition-all duration-300 hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 