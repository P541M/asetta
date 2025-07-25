import { useAuth } from "../../contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import UserSettings from "../settings/UserSettings";
import { useRouter } from "next/router";
import Avatar from "../ui/Avatar";
import { useUserProfile } from "../../hooks/useUserProfile";
import {
  getPersonalizedGreeting,
  getMillisecondsToNextGreetingUpdate,
  getRotatingSubtitle,
} from "../../utils/greetingUtils";

interface DashboardHeaderProps {
  onLogout?: () => Promise<void>;
}

const DashboardHeader = ({ onLogout }: DashboardHeaderProps) => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [isHeaderReady, setIsHeaderReady] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);
  const greetingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Initialize and update greeting
  useEffect(() => {
    // Reset ready state when user/profile changes
    setIsHeaderReady(false);

    const updateGreeting = () => {
      setGreeting(getPersonalizedGreeting(user, profile));
      setSubtitle(getRotatingSubtitle());
      // Small delay to ensure smooth animation
      setTimeout(() => setIsHeaderReady(true), 50);
    };

    // Initial greeting
    updateGreeting();

    // Schedule next update
    const scheduleNextUpdate = () => {
      const msToNext = getMillisecondsToNextGreetingUpdate();
      greetingTimeoutRef.current = setTimeout(() => {
        updateGreeting();
        scheduleNextUpdate(); // Schedule the next update
      }, msToNext);
    };

    scheduleNextUpdate();

    // Cleanup timeout on unmount
    return () => {
      if (greetingTimeoutRef.current) {
        clearTimeout(greetingTimeoutRef.current);
      }
    };
  }, [user, profile]);

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
      <div className="bg-light-bg-primary dark:bg-dark-bg-secondary border-b border-light-border-primary dark:border-dark-border-primary">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between min-h-[4rem]">
            {/* Left side - Personalized Greeting */}
            <div
              className={`flex items-center space-x-3 ${
                isHeaderReady ? "animate-fade-in-up" : "opacity-0"
              }`}
            >
              {/* <Avatar 
                size="md" 
                emoji={profile?.avatarEmoji} 
                className="ring-2 ring-light-button-primary dark:ring-dark-button-primary ring-opacity-20"
              /> */}
              <div className="flex flex-col">
                <h1
                  className="text-2xl md:text-3xl font-bold text-light-text-primary dark:text-dark-text-primary transition-all duration-300"
                  role="banner"
                  aria-label={`Dashboard greeting: ${greeting}`}
                >
                  {greeting}
                </h1>
                <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                  {subtitle}
                </p>
              </div>
            </div>

            {/* Right side - User Settings Menu */}
            <div
              className={`relative ${
                isHeaderReady ? "animate-fade-in-up" : "opacity-0"
              }`}
            >
              <button
                ref={avatarRef}
                onClick={toggleDropdown}
                className="flex items-center space-x-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-button-primary dark:hover:text-dark-button-primary transition-colors duration-200 focus:outline-none bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg shadow-sm border border-light-border-primary dark:border-dark-border-primary px-3 py-2 focus:ring-2 focus:ring-light-focus-ring dark:focus:ring-dark-focus-ring focus:ring-opacity-50"
                aria-label="User menu"
                aria-expanded={showDropdown}
                aria-haspopup="true"
              >
                <Avatar size="sm" emoji={profile?.avatarEmoji} />
                <span className="hidden md:block truncate max-w-[150px] text-light-text-primary dark:text-dark-text-primary font-medium">
                  {user?.displayName || user?.email}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 transition-transform duration-200 ${
                    showDropdown ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
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
                  className="absolute right-0 mt-2 w-48 bg-light-bg-primary dark:bg-dark-bg-secondary rounded-lg shadow-lg py-1 z-50 animate-fade-in-down border border-light-border-primary dark:border-dark-border-primary"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu"
                >
                  <div className="px-4 py-2 text-sm text-light-text-tertiary dark:text-dark-text-tertiary border-b border-light-border-primary dark:border-dark-border-primary">
                    Signed in as
                    <div className="font-medium text-light-text-primary dark:text-dark-text-primary truncate">
                      {user?.email}
                    </div>
                  </div>

                  {/* Settings option */}
                  <button
                    onClick={openSettings}
                    className="flex w-full items-center px-4 py-2 text-sm text-light-text-primary dark:text-dark-text-primary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary transition-colors duration-150"
                    role="menuitem"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-light-text-tertiary dark:text-dark-text-tertiary"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
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
                    className="flex w-full items-center px-4 py-2 text-sm text-light-text-primary dark:text-dark-text-primary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary transition-colors duration-150 border-t border-light-border-primary dark:border-dark-border-primary"
                    role="menuitem"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-light-text-tertiary dark:text-dark-text-tertiary"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
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
