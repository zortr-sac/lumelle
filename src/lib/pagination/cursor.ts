/**
 * Cursor-based pagination utility.
 *
 * Why not OFFSET? OFFSET 100000 makes Postgres scan and discard 100k rows on
 * every page change. With a cursor (`WHERE created_at < $last AND id < $lastId`)
 * the DB jumps directly to the position using an index — O(log n) per page.
 *
 * Cursor format: base64url(`${sortValue}|${id}`). Opaque to clients.
 */

const SEPARATOR = "|";

export type CursorTuple = [sortValue: string, id: string];

export function encodeCursor(
  sortValue: string | number | Date,
  id: string,
): string {
  const v =
    sortValue instanceof Date ? sortValue.toISOString() : String(sortValue);
  const raw = `${v}${SEPARATOR}${id}`;
  return Buffer.from(raw, "utf8").toString("base64url");
}

export function decodeCursor(
  cursor: string | null | undefined,
): CursorTuple | null {
  if (!cursor) return null;
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const idx = raw.lastIndexOf(SEPARATOR);
    if (idx < 0) return null;
    return [raw.slice(0, idx), raw.slice(idx + 1)];
  } catch {
    return null;
  }
}

export type PageResult<T> = {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
};

/**
 * Helper to build a paged response. Caller fetches `limit + 1` rows and lets
 * this util slice the extra row to compute `hasMore` and `nextCursor`.
 *
 * @param rows fetched rows (limit + 1)
 * @param limit page size
 * @param cursorOf function that returns the cursor string for a row
 */
export function paginate<T>(
  rows: T[],
  limit: number,
  cursorOf: (row: T) => string,
): PageResult<T> {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor =
    hasMore && items.length > 0 ? cursorOf(items[items.length - 1]!) : null;
  return { items, nextCursor, hasMore };
}
