import type { DocumentData } from "firebase/firestore";
import { storedDate } from "./dateUtils";

/** The fields of a semester doc that decide where the switcher lists it. */
export interface SemesterSortFields {
  id: string;
  order?: unknown;
  createdAt?: unknown;
}

/**
 * A semester doc as the switcher lists it. Every reader maps docs through this, so the
 * `/dashboard` redirect and the switcher sort on the same fields and agree on the first semester.
 */
export const semesterFromDoc = (id: string, data: DocumentData) => ({
  id,
  name: data.name,
  order: data.order,
  createdAt: data.createdAt,
});

const orderOf = (semester: SemesterSortFields): number | null =>
  typeof semester.order === "number" && Number.isFinite(semester.order) ? semester.order : null;

const createdAtOf = (semester: SemesterSortFields): number => {
  const time = storedDate(semester.createdAt)?.getTime();
  return time === undefined || Number.isNaN(time) ? -Infinity : time;
};

const compare = (a: number | string, b: number | string): number => (a < b ? -1 : a > b ? 1 : 0);

/**
 * The semesters in the switcher's order. Sorted here rather than by the query: Firestore's
 * `orderBy("order")` leaves out every doc without the field, and the oldest semesters have none.
 * Those come first, oldest first (no creation date counts as oldest): each semester created since
 * took the highest `order` plus 1, so it belongs after them. The rest go by `order`, and ties by
 * document ID, as Firestore breaks them.
 */
export function sortSemesters<T extends SemesterSortFields>(semesters: readonly T[]): T[] {
  return [...semesters].sort((a, b) => {
    const orderA = orderOf(a);
    const orderB = orderOf(b);
    if (orderA === null && orderB !== null) return -1;
    if (orderA !== null && orderB === null) return 1;
    const byPosition =
      orderA !== null && orderB !== null
        ? compare(orderA, orderB)
        : compare(createdAtOf(a), createdAtOf(b));
    return byPosition || compare(a.id, b.id);
  });
}
