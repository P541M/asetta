import Link from "next/link";
import { cn } from "@/lib/utils";
import { trackCTAClick } from "@/utils/analytics";
import { ArrowIcon } from "./icons";

const BASE_CLASSES =
  "group inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600";

const VARIANT_CLASSES = {
  primary: "bg-primary-600 text-white shadow-xs hover:bg-primary-700",
  /** Quiet text link with arrow, for secondary actions next to a primary CTA. */
  ghost: "text-stone-600 hover:text-stone-900",
} as const;

const SIZE_CLASSES = {
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
} as const;

type ButtonVariant = keyof typeof VARIANT_CLASSES;
type ButtonSize = keyof typeof SIZE_CLASSES;

/** Class list shared by ButtonLink and Button so links and buttons stay visually identical. */
function buttonClasses(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return cn(BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className);
}

function ArrowAffix() {
  return <ArrowIcon className="transition-transform duration-150 group-hover:translate-x-0.5" />;
}

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
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
      className={buttonClasses(variant, size, className)}
    >
      {children}
      {withArrow && <ArrowAffix />}
    </Link>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  withArrow?: boolean;
}

/** Native-button counterpart of ButtonLink, for form submits and in-page actions. */
export function Button({
  variant = "primary",
  size = "md",
  withArrow = false,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(
        variant,
        size,
        cn("disabled:cursor-not-allowed disabled:opacity-70", className),
      )}
      {...rest}
    >
      {children}
      {withArrow && <ArrowAffix />}
    </button>
  );
}
