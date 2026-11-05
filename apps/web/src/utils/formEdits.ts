/**
 * A form that starts from live values holds only the student's edits, so a value changed
 * elsewhere still shows in every field the student hasn't touched.
 */

/** The form as shown: the edits laid over the live values. */
export function formWithEdits<T extends object>(live: T, edits: Partial<T>): T {
  return { ...live, ...edits };
}

/** The edits that differ from `saved`, so a field typed in during a save outlives it. */
export function unsavedEdits<T extends object>(edits: Partial<T>, saved: T): Partial<T> {
  const entries = Object.entries(edits).filter(
    ([field, value]) => value !== saved[field as keyof T],
  );
  return Object.fromEntries(entries) as Partial<T>;
}

export function isDirty<T extends object>(edits: Partial<T>, saved: T): boolean {
  return Object.keys(unsavedEdits(edits, saved)).length > 0;
}
