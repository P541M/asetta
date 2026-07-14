import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  className?: string;
}

/**
 * Light/dark toggle. The icon swap is pure CSS (`dark:` visibility), so it is
 * correct before hydration — no mounted-guard, no flicker. The flip itself
 * cross-fades via the View Transitions API where supported (and unless the
 * user prefers reduced motion); otherwise it switches instantly.
 */
const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { resolvedTheme, setTheme } = useTheme();

  const toggle = () => {
    const flip = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (doc.startViewTransition && !reduceMotion) {
      doc.startViewTransition(flip);
    } else {
      flip();
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      aria-label="Toggle theme"
      onClick={toggle}
    >
      <Sun className="hidden dark:block" aria-hidden />
      <Moon className="dark:hidden" aria-hidden />
    </Button>
  );
};

export default ThemeToggle;
