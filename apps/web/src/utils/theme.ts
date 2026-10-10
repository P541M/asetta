/**
 * Sets the theme inside a View Transitions crossfade where supported
 * (skipped under prefers-reduced-motion; instant otherwise). The single
 * entry point for theme switching — see standards.md, Motion.
 */
export function setThemeWithTransition(theme: string, setTheme: (theme: string) => void): void {
  const apply = () => setTheme(theme);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
  if (doc.startViewTransition && !reduceMotion) {
    doc.startViewTransition(apply);
  } else {
    apply();
  }
}

/** Toggles between light and dark (the auth-page toggle) via the crossfade. */
export function flipThemeWithTransition(
  resolvedTheme: string | undefined,
  setTheme: (theme: string) => void,
): void {
  setThemeWithTransition(resolvedTheme === "dark" ? "light" : "dark", setTheme);
}
