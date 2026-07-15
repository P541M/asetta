import { getIconById, DEFAULT_ICON } from "../../data/profileIcons";
import { cn } from "@/lib/utils";

interface AvatarProps {
  size?: "xs" | "sm" | "md" | "lg";
  iconId?: string;
  className?: string;
}

const sizeClasses = {
  xs: "size-6",
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
};

const iconSizeClasses = {
  xs: "size-3",
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

const Avatar = ({ size = "md", iconId = DEFAULT_ICON.id, className }: AvatarProps) => {
  // Get icon data, fallback to default if invalid
  const iconData = getIconById(iconId) || DEFAULT_ICON;
  const IconComponent = iconData.icon;

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-secondary",
        sizeClasses[size],
        className,
      )}
    >
      <IconComponent
        className={cn(iconSizeClasses[size], "text-foreground")}
        aria-label={`User avatar icon: ${iconData.name}`}
      />
    </div>
  );
};

export default Avatar;
