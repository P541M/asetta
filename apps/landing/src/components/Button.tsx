import Link from "next/link";
import { cn } from "@/lib/utils";
import { trackCTAClick } from "@/utils/analytics";

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

const VARIANT_CLASSES = {
  primary: "bg-primary-600 text-white shadow-xs hover:bg-primary-700",
  /** Quiet text link with arrow, for secondary actions next to a primary CTA. */
  ghost: "text-stone-600 hover:text-stone-900",
} as const;

const SIZE_CLASSES = {
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
} as const;

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof VARIANT_CLASSES;
  size?: keyof typeof SIZE_CLASSES;
  withArrow?: boolean;
  /** When set, clicks are reported to analytics under this label. */
  trackLabel?: string;
  className?: string;
}

export default function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  withArrow = false,
  trackLabel,
  className,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      onClick={trackLabel ? () => trackCTAClick(trackLabel, href) : undefined}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
    >
      {children}
      {withArrow && (
        <ArrowIcon className="transition-transform duration-150 group-hover:translate-x-0.5" />
      )}
    </Link>
  );
}
