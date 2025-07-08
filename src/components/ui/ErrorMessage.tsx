interface ErrorMessageProps {
  message: string;
  className?: string;
}

const ErrorMessage = ({ message, className = "" }: ErrorMessageProps) => {
  return (
    <div className={`p-4 bg-light-error-bg border border-light-error-bg rounded-lg text-light-error-text animate-fade-in-up dark:bg-dark-error-bg dark:border-dark-error-bg dark:text-dark-error-text ${className}`}>
      <div className="flex items-start">
        <svg
          className="h-5 w-5 mr-3 mt-0.5 text-light-error-text dark:text-dark-error-text flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};

export default ErrorMessage;