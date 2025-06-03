export const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
};

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

export function transformSizesWithUniqueIds(
  topWearSizes: any,
  name: string,
  type: string,
  is_cm: boolean,
) {
  const size_data = [];
  const size_chart_data = [];

  for (const item of topWearSizes) {
    const { size, additionalFields } = item;
    const custom_size_id = crypto.randomUUID();

    size_data.push({
      name: name,
      size: type == "footwear" ? item.ukSize : size,
      type,
      has_size_chart: true,
      custom_size_id: custom_size_id,
      is_cm: is_cm,
    });

    

    if (type == "footwear") {
      const arr = [
        { label: "US", value: item.usSize },
        { label: "EURO", value: item.euroSize },
        { label: "To Fit Foot Length", value: item.actualSize },
      ];

      for (const field of arr) {
        size_chart_data.push({
          custom_size_id: custom_size_id,
          size_field_name: field.label,
          size_field_value: field.value,
        });
      }
    }else{
      for (const field of additionalFields) {
        size_chart_data.push({
          custom_size_id: custom_size_id,
          size_field_name: field.label,
          size_field_value: field.value,
        });
      }
    }
  }

  return {
    size_data,
    size_chart_data,
  };
}
