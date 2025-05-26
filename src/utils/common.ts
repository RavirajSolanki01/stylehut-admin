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

export const DEFAULT_DISCOUNT_OPTION = [
  {
    label: "10%",
    value: "10",
  },
  {
    label: "20%",
    value: "20",
  },
  {
    label: "30%",
    value: "30",
  },
  {
    label: "40%",
    value: "40",
  },
  {
    label: "50%",
    value: "50",
  },
  {
    label: "60%",
    value: "60",
  },
  {
    label: "70%",
    value: "70",
  },
  {
    label: "80%",
    value: "80",
  },
  {
    label: "90%",
    value: "90",
  },
];
