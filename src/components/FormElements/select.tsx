"use client";

import { ChevronUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import React, { useId, useState } from "react";

type PropsType = {
  label: string;
  items: { value: string; label: string }[];
  prefixIcon?: React.ReactNode;
  className?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBluer?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  required?: boolean;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  name?: string;
  error?: string;
};

export function Select({
  items,
  label,
  defaultValue = "",
  value,
  placeholder,
  prefixIcon,
  className,
  required,
  onChange,
  onBluer,
  name,
  error,
}: PropsType) {
  const id = useId();

  // Manage internal state only if value is not provided
  const [selected, setSelected] = useState(defaultValue);
  const isControlled = value !== undefined;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!isControlled) setSelected(e.target.value);
    onChange?.(e);
  };

  const isOptionSelected = isControlled ? value !== "" : selected !== "";

  return (
    <div className={cn("space-y-3", className)}>
      <label
        htmlFor={id}
        className="text-body-sm font-medium text-dark dark:text-white"
      >
        {label}
        {required && <span className="ml-1 select-none text-red">*</span>}
      </label>

      <div className="relative">
        {prefixIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            {prefixIcon}
          </div>
        )}

        <select
          id={id}
          name={name}
          value={isControlled ? value : selected}
          onChange={handleChange}
          onBlur={onBluer}
          className={cn(
            "w-full appearance-none rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary [&>option]:text-dark-5 dark:[&>option]:text-dark-6",
            isOptionSelected && "text-dark dark:text-white",
            prefixIcon && "pl-11.5",
          )}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {items.length > 0 ? (
            items.map((item) => (
              <option key={item.value} value={item.value} className="mb-2 mt-2">
                {item.label}
              </option>
            ))
          ) : (
            <option disabled>No options</option>
          )}
        </select>

        <ChevronUpIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-180" />
      </div>
      {error && <p className="mt-2 text-xs text-red">{error}</p>}
    </div>
  );
}
