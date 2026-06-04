import { useMemo, useState } from 'react';

export function useTableFilter<T>(
  rows: T[],
  query: string,
  match: (row: T, q: string) => boolean,
) {
  const [search, setSearch] = useState(query);
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter((row) => match(row, q));
  }, [rows, search, match]);
  return { search, setSearch, filtered };
}
