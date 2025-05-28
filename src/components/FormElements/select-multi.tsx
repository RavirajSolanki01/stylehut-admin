"use client";

import { ChevronUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import React, { useId, useState, useRef, useEffect } from "react";

type MultiSelectItem = {
  value: string;
  label: string;
};

type PropsType = {
  label: string;
  items: MultiSelectItem[];
  prefixIcon?: React.ReactNode;
  className?: string;
  onChange: (values: string[]) => void;
  onBlur?: () => void;
  required?: boolean;
  placeholder?: string;
  value?: string[];
  defaultValue?: string[];
  name?: string;
  error?: string;
  disabled?: boolean;
  maxDisplay?: number; // Maximum number of selected items to display before showing count
};

export function MultiSelect({
  items,
  label,
  defaultValue = [],
  value,
  placeholder = "Select options...",
  prefixIcon,
  className,
  required,
  onChange,
  onBlur,
  name,
  error,
  disabled,
  maxDisplay = 3,
}: PropsType) {
  const id = useId();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Manage internal state only if value is not provided
  const [selected, setSelected] = useState<string[]>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const isControlled = value !== undefined;

  const selectedValues = isControlled ? value : selected;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        onBlur?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onBlur]);

  const handleToggleOption = (optionValue: string) => {
    if (disabled) return;

    const newSelected = selectedValues.includes(optionValue)
      ? selectedValues.filter((val) => val !== optionValue)
      : [...selectedValues, optionValue];

    if (!isControlled) setSelected(newSelected);
    onChange(newSelected);
  };

  const handleClearAll = () => {
    if (disabled) return;
    if (!isControlled) setSelected([]);
    onChange([]);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;

    if (selectedValues.length <= maxDisplay) {
      return selectedValues
        .map((val) => items.find((item) => item.value === val)?.label)
        .filter(Boolean)
        .join(", ");
    }

    const displayItems = selectedValues
      .slice(0, maxDisplay)
      .map((val) => items.find((item) => item.value === val)?.label)
      .filter(Boolean);

    return `${displayItems.join(", ")} +${selectedValues.length - maxDisplay} more`;
  };

  return (
    <div className={cn("space-y-3", className)} ref={containerRef}>
      <label
        htmlFor={id}
        className="text-body-sm font-medium text-dark dark:text-white"
      >
        {label}
        {required && <span className="ml-1 select-none text-red">*</span>}
      </label>

      <div className="relative">
        {prefixIcon && (
          <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2">
            {prefixIcon}
          </div>
        )}

        {/* Hidden input for form submission */}
        <input type="hidden" name={name} value={selectedValues.join(",")} />

        {/* Display area */}
        <div
          id={id}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "w-full cursor-pointer rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary",
            selectedValues.length > 0 && "text-dark dark:text-white",
            selectedValues.length === 0 && "text-gray-500",
            prefixIcon && "pl-11.5",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="truncate">{getDisplayText()}</span>
            <div className="flex items-center gap-2">
              {selectedValues.length > 0 && !disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearAll();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              )}
              <ChevronUpIcon
                className={cn(
                  "transition-transform duration-200",
                  isOpen ? "rotate-0" : "rotate-180",
                )}
              />
            </div>
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && !disabled && (
          <div
            ref={dropdownRef}
            className="absolute top-full z-50 mt-1 w-full rounded-lg border border-stroke bg-white shadow-lg dark:border-dark-3 dark:bg-dark-2"
          >
            <div className="max-h-60 overflow-y-auto">
              {items.length > 0 ? (
                items.map((item) => (
                  <div
                    key={item.value}
                    onClick={() => handleToggleOption(item.value)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-dark-3",
                      selectedValues.includes(item.value) &&
                        "bg-primary/5 dark:bg-primary/10",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border-2 transition-colors",
                        selectedValues.includes(item.value)
                          ? "border-primary bg-primary"
                          : "border-gray-300 dark:border-gray-600",
                      )}
                    >
                      {selectedValues.includes(item.value) && (
                        <svg
                          className="h-2.5 w-2.5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-dark dark:text-white">
                      {item.label}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500">
                  No options available
                </div>
              )}
            </div>

            {/* Footer with selection count */}
            {selectedValues.length > 0 && (
              <div className="border-t border-stroke px-4 py-2 dark:border-dark-3">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{selectedValues.length} selected</span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-primary hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red">{error}</p>}
    </div>
  );
}
