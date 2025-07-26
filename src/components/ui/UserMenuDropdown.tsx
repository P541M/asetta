import React, { useRef, useEffect } from "react";

interface UserMenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onSettingsClick: (e: React.MouseEvent) => void;
  onLogoutClick: (e: React.MouseEvent) => void;
  className?: string;
  avatarRef?: React.RefObject<HTMLButtonElement | null>;
}

const UserMenuDropdown: React.FC<UserMenuDropdownProps> = ({
  isOpen,
  onClose,
  userEmail,
  onSettingsClick,
  onLogoutClick,
  className = "",
  avatarRef,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close if click is outside both dropdown and avatar button
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        avatarRef?.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose, avatarRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`absolute right-0 mt-2 w-48 bg-white dark:bg-dark-bg-tertiary border border-light-border-primary dark:border-dark-border-primary rounded-lg shadow-lg animate-scale-in z-50 ${className}`}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="user-menu"
    >
      {/* User Info Header */}
      <div className="px-4 py-3 border-b border-light-border-primary dark:border-dark-border-primary">
        <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
          Signed in as
        </p>
        <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary truncate">
          {userEmail}
        </p>
      </div>

      {/* Menu Items */}
      <div className="py-0">
        {/* Settings Button */}
        <button
          onClick={onSettingsClick}
          className="flex w-full items-center px-4 py-2 text-sm font-medium transition-colors duration-150 text-light-text-primary dark:text-dark-text-primary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary focus:bg-light-hover-primary dark:focus:bg-dark-hover-primary focus:outline-none"
          role="menuitem"
        >
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <span className="flex-shrink-0 text-light-text-tertiary dark:text-dark-text-tertiary">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </span>
            <span className="truncate min-w-0">Settings</span>
          </div>
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogoutClick}
          className="flex w-full items-center px-4 py-2 text-sm font-medium transition-colors duration-150 text-light-text-primary dark:text-dark-text-primary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary focus:bg-light-hover-primary dark:focus:bg-dark-hover-primary focus:outline-none border-t border-light-border-primary dark:border-dark-border-primary"
          role="menuitem"
        >
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <span className="flex-shrink-0 text-light-text-tertiary dark:text-dark-text-tertiary">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </span>
            <span className="truncate min-w-0">Logout</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default UserMenuDropdown;