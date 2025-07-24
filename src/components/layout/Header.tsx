// components/Header.tsx
import { useAuth } from "../../contexts/AuthContext";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import UserSettings from "../settings/UserSettings";
import { useRouter } from "next/router";
import Avatar from "../ui/Avatar";
import { useUserProfile } from "../../hooks/useUserProfile";

interface HeaderProps {
  onLogout?: () => Promise<void>;
}


const Header = ({ onLogout }: HeaderProps) => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

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

  // Handle click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  // Handle logout with proper dropdown closing
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(false);
    setTimeout(async () => {
      if (onLogout) {
        await onLogout();
      }
    }, 10);
  };

  // Toggle dropdown with proper event handling
  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  // Open settings page
  const openSettings = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(false);
    router.push("/settings");
  };

  // Close settings modal
  const closeSettings = () => {
    setShowSettings(false);
  };

  return (
    <>
      <header
        className={`navbar transition-all duration-300 ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <a href="https://asetta.me" className="flex items-center group">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-light-button-primary dark:text-dark-button-primary transition-transform duration-300 group-hover:scale-110"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                <span className="logo ml-2">Asetta</span>
              </a>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="relative">
                    <button
                      ref={avatarRef}
                      onClick={toggleDropdown}
                      className="flex items-center space-x-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-button-primary dark:hover:text-dark-button-primary transition-colors duration-200 focus:outline-none"
                    >
                      <Avatar size="sm" emoji={profile?.avatarEmoji} />
                      <span className="hidden md:block truncate max-w-[150px] text-light-text-primary dark:text-dark-text-primary font-medium">
                        {user.displayName || user.email}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 transition-transform duration-150 ${
                          showDropdown ? "rotate-180" : ""
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {showDropdown && (
                      <div
                        ref={dropdownRef}
                        className="absolute right-0 mt-2 w-48 bg-light-bg-primary dark:bg-dark-bg-secondary rounded-lg shadow-lg py-1 z-10 animate-fade-in-down border border-light-border-primary dark:border-dark-border-primary"
                      >
                        <div className="px-4 py-2 text-sm text-light-text-tertiary dark:text-dark-text-tertiary border-b border-light-border-primary dark:border-dark-border-primary">
                          Signed in as
                          <div className="font-medium text-light-text-primary dark:text-dark-text-primary truncate">
                            {user.email}
                          </div>
                        </div>

                        <button
                          onClick={openSettings}
                          className="flex w-full items-center px-4 py-2 text-sm text-light-text-primary dark:text-dark-text-primary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary transition-colors duration-150"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2 text-light-text-tertiary dark:text-dark-text-tertiary"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Settings
                        </button>

                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-2 text-sm text-light-text-primary dark:text-dark-text-primary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary transition-colors duration-150 border-t border-light-border-primary dark:border-dark-border-primary"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2 text-light-text-tertiary dark:text-dark-text-tertiary"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 3a1 1 0 10-2 0v6.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L14 12.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/login"
                      className="text-light-text-primary dark:text-dark-text-primary hover:text-light-button-primary dark:hover:text-dark-button-primary transition-colors duration-200 text-sm font-medium"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="btn-primary text-sm px-4 py-2"
                    >
                      Register
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      {showSettings && (
        <UserSettings isOpen={showSettings} onClose={closeSettings} />
      )}
    </>
  );
};

export default Header;
