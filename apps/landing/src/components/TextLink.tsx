import { cn } from "@/lib/utils";

interface TextLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/** Standard inline text link: stone underline that warms on hover. */
export default function TextLink({ href, children, className }: TextLinkProps) {
  const external = href.startsWith("http");

  return (
    <a
      href={href}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      className={cn(
        "font-medium text-stone-900 underline underline-offset-4 transition-colors duration-150 hover:text-primary-700",
        className
      )}
    >
      {children}
    </a>
  );
}
