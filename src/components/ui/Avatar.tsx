import Image from "next/image";

interface AvatarProps {
  size?: "xs" | "sm" | "md" | "lg";
  color?: "blue" | "green" | "purple" | "orange" | "red" | "pink" | "indigo" | "teal";
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
  className = "" 
}: AvatarProps) => {
  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center bg-light-background-secondary dark:bg-dark-background-secondary border border-light-border dark:border-dark-border ${className}`}>
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