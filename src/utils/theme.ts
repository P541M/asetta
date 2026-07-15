/**
 * Flips the theme inside a View Transitions crossfade where supported
 * (skipped under prefers-reduced-motion; instant otherwise). The single
 * entry point for theme switching — see standards.md, Motion.
 */
export function flipThemeWithTransition(
  resolvedTheme: string | undefined,
  setTheme: (theme: string) => void,
): void {
  const flip = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
  if (doc.startViewTransition && !reduceMotion) {
    doc.startViewTransition(flip);
  } else {
    flip();
  }
}
