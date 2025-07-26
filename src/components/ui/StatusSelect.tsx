import React, { useState, useRef, useEffect, useCallback } from "react";
import { Assessment } from "../../types/assessment";

export type StatusValue = Assessment["status"];

interface StatusOption {
  value: StatusValue;
  label: string;
  icon: React.ReactElement;
  colorClass: string;
  bgClass: string;
}

interface StatusSelectProps {
  value: StatusValue | null;
  onChange: (value: StatusValue) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  placeholder?: string;
}

const statusOptions: StatusOption[] = [
  {
    value: "Not started",
    label: "Not Started",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <path strokeWidth="2" d="M12 6v6l4 2" />
      </svg>
    ),
    colorClass: "text-gray-600 dark:text-gray-400",
    bgClass: "bg-gray-100 dark:bg-gray-800",
  },
  {
    value: "In progress",
    label: "In Progress",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <polyline points="12,6 12,12 16,14" strokeWidth="2" />
      </svg>
    ),
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-100 dark:bg-amber-900/30",
  },
  {
    value: "Submitted",
    label: "Submitted",
    icon: (
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
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  {
    value: "Missed",
    label: "Missed",
    icon: (
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
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
    colorClass: "text-red-600 dark:text-red-400",
    bgClass: "bg-red-100 dark:bg-red-900/30",
  },
];

const StatusSelect: React.FC<StatusSelectProps> = ({
  value,
  onChange,
  disabled = false,
  size = "md",
  className = "",
  placeholder = "Select status",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption = value
    ? statusOptions.find((option) => option.value === value)
    : null;

  // Size variants
  const sizeClasses = {
    sm: "px-2 py-1.5 text-sm",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  // Get the text size class for consistency
  const textSizeClass = size === "lg" ? "text-base" : "text-sm";

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setFocusedIndex(-1);
    }
  };

  const handleSelect = useCallback(
    (optionValue: StatusValue) => {
      onChange(optionValue);
      setIsOpen(false);
      setFocusedIndex(-1);
      triggerRef.current?.focus();
    },
    [onChange]
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setFocusedIndex((prev) =>
            prev < statusOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : statusOptions.length - 1
          );
          break;
        case "Enter":
          event.preventDefault();
          if (focusedIndex >= 0) {
            handleSelect(statusOptions[focusedIndex].value);
          }
          break;
        case "Escape":
          event.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          triggerRef.current?.focus();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, focusedIndex, handleSelect]);

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block text-left min-w-[120px] max-w-full ${className}`}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="status-select-label"
        className={`
          w-full rounded-lg border transition-all duration-200 flex items-center justify-between
          ${sizeClasses[size]}
          ${
            disabled
              ? "bg-light-disabled-bg dark:bg-dark-disabled-bg text-light-disabled-text dark:text-dark-disabled-text cursor-not-allowed border-light-border-primary dark:border-dark-border-primary"
              : "bg-white dark:bg-dark-bg-tertiary border-light-border-primary dark:border-dark-border-primary hover:border-light-button-primary dark:hover:border-dark-button-primary focus:ring-2 focus:ring-light-focus-ring dark:focus:ring-dark-focus-ring focus:border-light-button-primary dark:focus:border-dark-button-primary cursor-pointer"
          }
          ${
            isOpen
              ? "ring-2 ring-light-focus-ring dark:ring-dark-focus-ring border-light-button-primary dark:border-dark-button-primary"
              : ""
          }
        `}
      >
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {selectedOption ? (
            <>
              <span className={`flex-shrink-0 ${selectedOption.colorClass}`}>
                {selectedOption.icon}
              </span>
              <span
                className={`truncate font-medium ${selectedOption.colorClass} min-w-0`}
              >
                {selectedOption.label}
              </span>
            </>
          ) : (
            <span className="text-light-text-tertiary dark:text-dark-text-tertiary truncate">
              {placeholder}
            </span>
          )}
        </div>

        {/* Dropdown Arrow */}
        <svg
          className={`w-4 h-4 ml-1 flex-shrink-0 transition-transform duration-200 text-light-text-tertiary dark:text-dark-text-tertiary ${
            isOpen ? "transform rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full min-w-[160px] mt-1 bg-white dark:bg-dark-bg-tertiary border border-light-border-primary dark:border-dark-border-primary rounded-lg shadow-lg animate-scale-in">
          <div
            role="listbox"
            aria-labelledby="status-select-label"
            className="max-h-60 overflow-auto"
          >
            {statusOptions.map((option, index) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full px-3 py-2 text-left flex items-center justify-between min-w-0 transition-colors duration-150 ${textSizeClass}
                  ${
                    value === option.value
                      ? `${option.bgClass} ${option.colorClass}`
                      : "hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary"
                  }
                  ${
                    focusedIndex === index
                      ? "bg-light-hover-primary dark:bg-dark-hover-primary"
                      : ""
                  }
                `}
              >
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <span className={`flex-shrink-0 ${option.colorClass}`}>
                    {option.icon}
                  </span>
                  <span
                    className={`font-medium ${option.colorClass} truncate min-w-0`}
                  >
                    {option.label}
                  </span>
                </div>
                {value === option.value && (
                  <span className="flex-shrink-0">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusSelect;
