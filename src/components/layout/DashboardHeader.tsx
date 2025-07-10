import { useAuth } from "../../contexts/AuthContext";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import UserSettings from "../settings/UserSettings";
import { useRouter } from "next/router";

interface DashboardHeaderProps {
  onLogout?: () => Promise<void>;
}

// Add a loader function for user avatars
const avatarLoader = ({ src }: { src: string }) => {
  // Return the URL directly if it's already a full URL (e.g., from Google)
  if (src.startsWith("http")) {
    return src;
  }
  // Add your default avatar URL here if needed
  return `/default-avatar.png`;
};

const DashboardHeader = ({ onLogout }: DashboardHeaderProps) => {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  // Handle click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close if click is outside both the dropdown and avatar button
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

    // Close dropdown before logging out
    setShowDropdown(false);

    // Small delay to ensure dropdown closes before logout
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

  if (!user) return null;

  return (
    <>
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50">
        <div className="relative">
          <button
            ref={avatarRef}
            onClick={toggleDropdown}
            className="flex items-center space-x-2 text-gray-600 dark:text-dark-text-secondary hover:text-light-button-primary dark:hover:text-dark-button-primary transition-colors duration-200 focus:outline-none bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm border border-gray-100 dark:border-dark-border-primary px-3 py-2"
          >
            {user.photoURL ? (
              <div className="relative h-8 w-8">
                <Image
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  width={32}
                  height={32}
                  className="rounded-full object-cover border border-gray-200 dark:border-dark-border-primary"
                  loader={avatarLoader}
                />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-light-button-primary/10 dark:bg-dark-button-primary/10 flex items-center justify-center text-light-button-primary dark:text-dark-button-primary border border-light-button-primary/20 dark:border-dark-button-primary/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
            <span className="hidden md:block truncate max-w-[150px] dark:text-dark-text-primary">
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
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg py-1 z-10 animate-fade-in-down border border-gray-100 dark:border-dark-border-primary"
            >
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-dark-text-tertiary border-b border-gray-100 dark:border-dark-border-primary">
                Signed in as
                <div className="font-medium text-gray-900 dark:text-dark-text-primary truncate">
                  {user.email}
                </div>
              </div>

              {/* Settings option */}
              <button
                onClick={openSettings}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors duration-150"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2 text-gray-500 dark:text-dark-text-tertiary"
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

              {/* Logout option */}
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors duration-150 border-t border-gray-100 dark:border-dark-border-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2 text-gray-500 dark:text-dark-text-tertiary"
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
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <UserSettings isOpen={showSettings} onClose={closeSettings} />
      )}
    </>
  );
};

export default DashboardHeader;
