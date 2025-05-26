export const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
};

// Reusable functions

export function getMaxKeyValue(
  obj: Record<string, number | string>,
): { key: string; value: number | string } | null {
  let maxKey: string | null = null;
  let maxValue = -Infinity;

  for (const [key, value] of Object.entries(obj)) {
    if (Number(value) > maxValue) {
      maxValue = Number(value);
      maxKey = key;
    }
  }

  return maxKey !== null ? { key: maxKey, value: maxValue } : null;
}
