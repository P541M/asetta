import { useEffect, useState } from "react";
import { getFromLocalStorage, setToLocalStorage } from "../../../utils/localStorage";
import { Assessment } from "../../../types/assessment";

/**
 * Sort/filter settings for the assessments table, persisted to localStorage.
 * Sort key/order currently have no UI to change them (initialized from storage only).
 */
export function useTableSettings() {
  const [sortKey] = useState<keyof Assessment>(() =>
    getFromLocalStorage<keyof Assessment>("assessmentSortKey", "dueDate"),
  );
  const [sortOrder] = useState<"asc" | "desc">(() =>
    getFromLocalStorage<"asc" | "desc">("assessmentSortOrder", "asc"),
  );
  const [filter, setFilter] = useState<string>(() =>
    getFromLocalStorage<string>("assessmentFilter", "all"),
  );

  useEffect(() => {
    setToLocalStorage("assessmentSortKey", sortKey);
  }, [sortKey]);

  useEffect(() => {
    setToLocalStorage("assessmentSortOrder", sortOrder);
  }, [sortOrder]);

  useEffect(() => {
    setToLocalStorage("assessmentFilter", filter);
  }, [filter]);

  return { sortKey, sortOrder, filter, setFilter };
}
