import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "logo-only" | "logo-with-text";
  color?: "primary" | "white" | "dark" | "inherit";
  href?: string;
  className?: string;
  showText?: boolean;
}

const sizeClasses = {
  xs: "h-5 w-5",
  sm: "h-7 w-7",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-17 w-17",
};

const textSizeClasses = {
  xs: "text-lg",
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
};

const Logo = ({
  size = "md",
  variant = "logo-with-text",
  color = "primary",
  href,
  className = "",
  showText = true,
}: LogoProps) => {
  const logoElement = (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* SVG Logo */}
      <div className={`${sizeClasses[size]} relative flex-shrink-0`}>
        <Image
          src="/images/Asetta_Logo.svg"
          alt="Asetta Logo"
          width={80}
          height={80}
          className={`w-full h-full object-contain transition-all duration-300 ${
            color === "primary"
              ? "filter-primary-main"
              : color === "white"
              ? "filter-white-main"
              : color === "dark"
              ? "filter-dark-main"
              : ""
          }`}
          priority
        />
      </div>

      {/* Text Logo */}
      {(variant === "logo-with-text" || showText) && (
        <span
          className={`font-extrabold text-light-text-primary dark:text-dark-text-primary transition-all duration-300 tracking-tight ${textSizeClasses[size]}`}
        >
          Asetta
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group">
        <div className="group-hover:scale-105 transition-transform duration-300">
          {logoElement}
        </div>
      </Link>
    );
  }

  return logoElement;
};

export default Logo;
