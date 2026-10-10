import { cn } from "@/lib/utils";

interface AvatarProps {
  name?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  xs: "size-6 text-xs",
  sm: "size-8 text-sm",
  md: "size-10 text-base",
  lg: "size-12 text-lg",
};

const Avatar = ({ name, size = "md", className }: AvatarProps) => {
  const initial = name?.trim().charAt(0).toUpperCase() || "U";

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary select-none",
        sizeClasses[size],
        className,
      )}
      aria-hidden
    >
      {initial}
    </div>
  );
};

export default Avatar;
