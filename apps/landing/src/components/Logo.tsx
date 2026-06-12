import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Wraps the logo in a link when provided. */
  href?: string;
  className?: string;
}

export default function Logo({ href, className }: LogoProps) {
  const logo = (
    <span className={cn("flex items-center gap-3", className)}>
      <span className="relative h-7 w-7 shrink-0">
        <Image
          src="/images/Asetta_Logo.svg"
          alt="Asetta logo"
          width={80}
          height={80}
          className="filter-primary h-full w-full object-contain"
          priority
        />
      </span>
      <span className="text-xl font-semibold tracking-tight text-stone-900">Asetta</span>
    </span>
  );

  if (!href) return logo;

  return (
    <Link href={href} className="transition-opacity duration-150 hover:opacity-80">
      {logo}
    </Link>
  );
}
