import { getIconById, DEFAULT_ICON } from "../../data/profileIcons";

interface AvatarProps {
  size?: "xs" | "sm" | "md" | "lg";
  iconId?: string;
  className?: string;
}

const sizeClasses = {
  xs: "h-6 w-6",
  sm: "h-8 w-8", 
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const iconSizeClasses = {
  xs: "h-3 w-3",
  sm: "h-4 w-4", 
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const Avatar = ({ 
  size = "md", 
  iconId = DEFAULT_ICON.id,
  className = "" 
}: AvatarProps) => {
  const containerClasses = `${sizeClasses[size]} rounded-full flex items-center justify-center bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary ${className}`;

  // Get icon data, fallback to default if invalid
  const iconData = getIconById(iconId) || DEFAULT_ICON;
  const IconComponent = iconData.icon;

  return (
    <div className={containerClasses}>
      <IconComponent 
        className={`${iconSizeClasses[size]} text-light-text-primary dark:text-dark-text-primary`}
        aria-label={`User avatar icon: ${iconData.name}`}
      />
    </div>
  );
};

export default Avatar;