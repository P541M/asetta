export const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const MAX_DOC_ID_BYTES = 1500;

/**
 * A string Firestore accepts as one document ID, so it can't reach another path when it is
 * interpolated into one: not empty, no "/", not "." or "..", not `__.*__`, at most 1,500 bytes.
 */
export const isValidDocId = (value: unknown): value is string =>
  typeof value === "string" &&
  value.length > 0 &&
  !value.includes("/") &&
  value !== "." &&
  value !== ".." &&
  !/^__.*__$/.test(value) &&
  new TextEncoder().encode(value).length <= MAX_DOC_ID_BYTES;
