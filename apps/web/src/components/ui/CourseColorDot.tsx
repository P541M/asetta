import { cn } from "@/lib/utils";

/**
 * The shared course-color dot (standards.md v4.3): decorative reinforcement
 * beside a visible course name — never the only identity carrier, never
 * interactive by itself. `color` is a "#RRGGBB" hex (user data), rendered via
 * inline style by design.
 */
const CourseColorDot = ({ color, className }: { color: string; className?: string }) => (
  <span
    aria-hidden
    className={cn("size-2 shrink-0 rounded-full", className)}
    style={{ backgroundColor: color }}
  />
);

export default CourseColorDot;
