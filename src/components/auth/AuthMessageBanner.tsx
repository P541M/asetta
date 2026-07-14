interface AuthMessageBannerProps {
  type: "error" | "success";
  title: string;
  text: string;
}

/** Error/success banner shown at the top of the auth cards. */
const AuthMessageBanner = ({ type, title, text }: AuthMessageBannerProps) => (
  <div
    className={`mb-6 p-4 ${
      type === "error"
        ? "bg-light-error-bg dark:bg-dark-error-bg border border-light-error-text/20 dark:border-dark-error-text/20"
        : "bg-light-success-bg dark:bg-dark-success-bg border border-light-success-text/20 dark:border-dark-success-text/20"
    } rounded-lg shadow-sm`}
  >
    <div className="flex items-start">
      <div className="flex-shrink-0">
        {type === "error" ? (
          <svg
            className="h-5 w-5 text-light-error-text dark:text-dark-error-text"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            className="h-5 w-5 text-light-success-text dark:text-dark-success-text"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      <div className="ml-3">
        <h3
          className={`text-sm font-medium ${
            type === "error"
              ? "text-light-error-text dark:text-dark-error-text"
              : "text-light-success-text dark:text-dark-success-text"
          }`}
        >
          {title}
        </h3>
        <div
          className={`mt-1 text-sm ${
            type === "error"
              ? "text-light-error-text dark:text-dark-error-text"
              : "text-light-success-text dark:text-dark-success-text"
          }`}
        >
          {text}
        </div>
      </div>
    </div>
  </div>
);

export default AuthMessageBanner;
