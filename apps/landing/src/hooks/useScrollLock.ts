import { useLayoutEffect } from "react";

/* Overlays can stack, so they share one lock: the page stays locked until the last one
   closes. */
let openOverlays = 0;

function lockPage() {
  const html = document.documentElement;
  /* The strip globals.css keeps for the page scrollbar (0 where scrollbars float). Measured on
     the box, not clientWidth, which ignores a strip with no scrollbar in it. Dropping the strip
     lets the backdrop reach the window's edge; padding the body by it keeps the page still, and
     fixed full-width bars keep their width with right-[var(--scroll-lock-strip,0px)]. */
  const strip = `${window.innerWidth - html.getBoundingClientRect().width}px`;
  html.style.overflow = "hidden";
  html.style.scrollbarGutter = "auto";
  html.style.setProperty("--scroll-lock-strip", strip);
  document.body.style.paddingRight = strip;
}

function unlockPage() {
  const html = document.documentElement;
  html.style.overflow = "";
  html.style.scrollbarGutter = "";
  html.style.removeProperty("--scroll-lock-strip");
  document.body.style.paddingRight = "";
}

/** Stops the page scrolling behind an overlay while `active` is true. */
export function useScrollLock(active = true) {
  // Before paint, so the first frame of an overlay never shows the strip uncovered
  useLayoutEffect(() => {
    if (!active) return;
    if (openOverlays++ === 0) lockPage();
    return () => {
      if (--openOverlays === 0) unlockPage();
    };
  }, [active]);
}
