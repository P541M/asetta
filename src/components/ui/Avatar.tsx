import Image from "next/image";

interface AvatarProps {
  size?: "xs" | "sm" | "md" | "lg";
  color?: "blue" | "green" | "purple" | "orange" | "red" | "pink" | "indigo" | "teal";
  emoji?: string;
  className?: string;
}

const sizeClasses = {
  xs: "h-6 w-6",
  sm: "h-8 w-8", 
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const logoSizeClasses = {
  xs: "h-3 w-3",
  sm: "h-5 w-5", 
  md: "h-6 w-6",
  lg: "h-7 w-7",
};

const emojiSizeClasses = {
  xs: "text-xs",
  sm: "text-sm", 
  md: "text-lg",
  lg: "text-xl",
};

const colorClasses = {
  blue: "filter-blue-avatar",
  green: "filter-green-avatar", 
  purple: "filter-purple-avatar",
  orange: "filter-orange-avatar",
  red: "filter-red-avatar",
  pink: "filter-pink-avatar",
  indigo: "filter-indigo-avatar",
  teal: "filter-teal-avatar",
};

const Avatar = ({ 
  size = "md", 
  color = "blue", 
  emoji,
  className = "" 
}: AvatarProps) => {
  const containerClasses = `${sizeClasses[size]} rounded-full flex items-center justify-center bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary ${className}`;

  // Render emoji if provided
  if (emoji) {
    return (
      <div className={containerClasses}>
        <span 
          className={`${emojiSizeClasses[size]} select-none leading-none`}
          role="img"
          aria-label="User avatar emoji"
        >
          {emoji}
        </span>
      </div>
    );
  }

  // Fallback to color-filtered logo system
  return (
    <div className={containerClasses}>
      <div className={`${logoSizeClasses[size]} relative flex-shrink-0`}>
        <Image
          src="/images/Asetta_Logo.svg"
          alt="Avatar"
          width={48}
          height={48}
          className={`w-full h-full object-contain transition-all duration-300 ${colorClasses[color]}`}
          priority
        />
      </div>
    </div>
  );
};

export default Avatar;