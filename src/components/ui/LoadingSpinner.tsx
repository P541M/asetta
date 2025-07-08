interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LoadingSpinner = ({ size = "md", className = "" }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-2", 
    lg: "h-12 w-12 border-2"
  };

  return (
    <div className={`animate-spin rounded-full border-light-button-primary border-t-transparent dark:border-dark-button-primary dark:border-t-transparent ${sizeClasses[size]} ${className}`} />
  );
};

export default LoadingSpinner;