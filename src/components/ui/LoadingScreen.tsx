interface LoadingScreenProps {
  /** Exact background classes vary by page; defaults match the dashboard/settings screens. */
  backgroundClassName?: string;
  textClassName?: string;
}

/** Full-screen centered spinner shown while auth/data is loading. */
const LoadingScreen = ({
  backgroundClassName = "bg-light-bg-secondary dark:bg-dark-bg-primary",
  textClassName = "text-light-text-secondary dark:text-dark-text-secondary",
}: LoadingScreenProps) => (
  <div className={`min-h-screen flex items-center justify-center ${backgroundClassName}`}>
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-light-button-primary border-t-transparent dark:border-dark-button-primary dark:border-t-transparent"></div>
      <p className={`mt-4 ${textClassName}`}>Loading...</p>
    </div>
  </div>
);

export default LoadingScreen;
