import { useEffect, useRef } from "react";

interface AddSemesterInputProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  onCancel: () => void;
  isAdding: boolean;
}

/** Inline "new semester" input row shown under the tabs. */
const AddSemesterInput = ({
  containerRef,
  value,
  onChange,
  onAdd,
  onCancel,
  isAdding,
}: AddSemesterInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when the input row appears
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      className="px-4 py-2 border-t border-light-border-primary dark:border-dark-border-primary"
      ref={containerRef}
    >
      <div className="flex items-center space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter semester name"
          className="flex-1 px-3 py-1.5 text-sm border border-light-border-primary dark:border-dark-border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-light-focus-ring dark:focus:ring-dark-focus-ring focus:border-transparent bg-light-input-bg dark:bg-dark-input-bg text-light-input-text dark:text-dark-input-text"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onAdd();
            } else if (e.key === "Escape") {
              onCancel();
            }
          }}
        />
        <button
          onClick={onAdd}
          disabled={isAdding || !value.trim()}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            isAdding || !value.trim()
              ? "bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-tertiary dark:text-dark-text-tertiary cursor-not-allowed"
              : "bg-light-button-primary text-white hover:bg-light-button-primary-hover dark:bg-dark-button-primary dark:hover:bg-dark-button-primary-hover"
          }`}
        >
          {isAdding ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Add
            </span>
          ) : (
            "Add"
          )}
        </button>
      </div>
    </div>
  );
};

export default AddSemesterInput;
