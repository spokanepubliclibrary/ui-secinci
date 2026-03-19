import React, { useState, useCallback, useEffect } from 'react';

export const STORAGE_KEY = 'ui-secinci-visible-columns';

export default function usePersistedColumns(possibleColumns) {
  // walk through the canonical list and retain only the columns that are currently visible, in their canonical order
  const reorderToCanonical = (columns, canonicalOrder) =>
    canonicalOrder.filter(col => columns.includes(col));

  const [visibleColumns, setVisibleColumns] = useState(() => {
    // load from sessionStorage
    const stored = sessionStorage.getItem(STORAGE_KEY);

    try {
      const parsed = JSON.parse(stored);
      // keep only valid column IDs
      const filtered = Array.isArray(parsed) && parsed.length
        ? parsed.filter(col => possibleColumns.includes(col))
        : possibleColumns;

      // initialize with canon
      return reorderToCanonical(filtered, possibleColumns);
    } catch {
      return possibleColumns;
    }
  });

  // sync visibleColumns from sessionStorage on each mount/render
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);

    try {
      const parsed = JSON.parse(stored);
      const filtered = Array.isArray(parsed) && parsed.length
        ? parsed.filter(col => possibleColumns.includes(col))
        : possibleColumns;

      const canonical = reorderToCanonical(filtered, possibleColumns);
      setVisibleColumns((current) => {
        const joined = (arr) => arr.join('|');
        return joined(current) === joined(canonical) ? current : canonical;
      });
    } catch {
      setVisibleColumns(possibleColumns);
    }
  }, [possibleColumns]);

  const toggleColumn = useCallback((colId) => {
    setVisibleColumns(prev => {
      const isRemoving = prev.includes(colId);
      // const isLastOne = prev.length === 1;

      // if (isRemoving && isLastOne) {
      //   return prev;
      // }

      let next = isRemoving
        ? prev.filter(c => c !== colId)
        : [...prev, colId];

      // return enforced canonical order after every toggle, regardless of toggle sequence
      next = reorderToCanonical(next, possibleColumns);

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [possibleColumns]);

  return [visibleColumns, toggleColumn];
}
