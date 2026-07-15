import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "size-5 border-2",
  md: "size-8 border-[3px]",
  lg: "size-12 border-4",
};

/** Inline activity spinner: tonal track with an amber head. */
const LoadingSpinner = ({ size = "md", className }: LoadingSpinnerProps) => (
  <div
    role="status"
    aria-label="Loading"
    className={cn(
      "rounded-full border-secondary border-t-primary motion-safe:animate-spin",
      sizeClasses[size],
      className,
    )}
  />
);

export default LoadingSpinner;
