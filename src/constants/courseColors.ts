/**
 * Course colors are user-chosen hex values (standards.md v4.3): stored as
 * "#RRGGBB" in coursePreferences/{courseName}.color and rendered via inline
 * style — the sanctioned exception to the tokens-only rule, because they are
 * user data, not theme styling. Unset courses fall back to a stable
 * name-hash default from the presets below.
 */

/** Quick-pick presets in the color picker, and the default pool for unset
    courses. Six mid-range steps chosen to read on both themes, in spectral
    order. */
export const COURSE_COLOR_PRESETS: readonly string[] = [
  "#3B82F6", // blue
  "#0D9488", // teal
  "#65A30D", // lime
  "#A16207", // bronze
  "#9333EA", // purple
  "#EC4899", // pink
];

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export const isValidCourseColor = (value: unknown): value is string =>
  typeof value === "string" && HEX_COLOR_PATTERN.test(value);

/* djb2 — deterministic across sessions and devices so unset courses keep the
   same default everywhere without any writes. */
const defaultCourseColor = (courseName: string): string => {
  let hash = 5381;
  for (let i = 0; i < courseName.length; i++) {
    hash = (hash * 33) ^ courseName.charCodeAt(i);
  }
  return COURSE_COLOR_PRESETS[Math.abs(hash) % COURSE_COLOR_PRESETS.length];
};

/** Stored hex when valid; otherwise the course's stable default. */
export const resolveCourseColor = (stored: string | undefined, courseName: string): string =>
  isValidCourseColor(stored) ? stored.toUpperCase() : defaultCourseColor(courseName);
