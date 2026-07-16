import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { flipThemeWithTransition } from "@/utils/theme";

interface ThemeToggleProps {
  className?: string;
}

/**
 * Standalone light/dark toggle (auth pages). Inside the app theme lives in
 * Settings instead (a Light/Dark/System selector). The icon swap is pure CSS
 * (`dark:` visibility), so it is correct before hydration — no mounted-guard,
 * no flicker.
 */
const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      aria-label="Toggle theme"
      onClick={() => flipThemeWithTransition(resolvedTheme, setTheme)}
    >
      <Sun className="hidden dark:block" aria-hidden />
      <Moon className="dark:hidden" aria-hidden />
    </Button>
  );
};

export default ThemeToggle;
