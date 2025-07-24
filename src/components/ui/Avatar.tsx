import { DEFAULT_EMOJI } from "../../data/emojis";

interface AvatarProps {
  size?: "xs" | "sm" | "md" | "lg";
  emoji?: string;
  className?: string;
  // Legacy prop for backward compatibility - not used
  color?: string;
}

const sizeClasses = {
  xs: "h-6 w-6",
  sm: "h-8 w-8", 
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const emojiSizeClasses = {
  xs: "text-xs",
  sm: "text-sm", 
  md: "text-lg",
  lg: "text-xl",
};

const Avatar = ({ 
  size = "md", 
  emoji = DEFAULT_EMOJI,
  className = "" 
}: AvatarProps) => {
  const containerClasses = `${sizeClasses[size]} rounded-full flex items-center justify-center bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary ${className}`;

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
};

export default Avatar;