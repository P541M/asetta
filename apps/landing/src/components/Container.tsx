import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section";
}

/**
 * The standard page frame: max-w-6xl with site gutters. Every page-level
 * block uses this so widths and gutters stay identical across all pages.
 * Narrower content (prose) nests a `max-w-3xl` block inside it.
 */
export default function Container({ children, className, as: Tag = "div" }: ContainerProps) {
  return <Tag className={cn("mx-auto max-w-6xl px-6 lg:px-8", className)}>{children}</Tag>;
}
