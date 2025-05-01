"use client";

import { Calendar } from "@/components/Layouts/sidebar/icons";
import flatpickr from "flatpickr";
import { useEffect, useRef } from "react";

type DatePickerOneProps = {
  label?: string;
  name?: string;
  required?: boolean;
  value?: string;
  onChange?: (date: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  maxDate?: Date;
};

const DatePickerOne: React.FC<DatePickerOneProps> = ({
  label = "Date Picker",
  name,
  required,
  value,
  onChange,
  onBlur,
  placeholder = "mm/dd/yyyy",
  error,
  className,
  maxDate,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      flatpickr(inputRef.current, {
        mode: "single",
        static: true,
        monthSelectorType: "static",
        dateFormat: "M j, Y",
        defaultDate: value,
        maxDate: maxDate,
        onChange: (selectedDates) => {
          const formatted = selectedDates[0]?.toDateString() || "";
          if (onChange) onChange(formatted);
        },
        onClose: () => {
          if (onBlur && inputRef.current) {
            const blurEvent = new FocusEvent("blur", { bubbles: true });
            inputRef.current.dispatchEvent(blurEvent);
            onBlur(blurEvent as unknown as React.FocusEvent<HTMLInputElement>);
          }
        },
      });
    }
  }, [onChange, value, onBlur]);

  return (
    <div className={className}>
      <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
        {label}
        {required && <span className="ml-1 select-none text-red">*</span>}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          className={
            "form-datepicker w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
          }
          name={name}
          placeholder={placeholder}
          required={required}
          defaultValue={value}
        />

        <div className="pointer-events-none absolute inset-0 left-auto right-5 flex items-center">
          <Calendar className="size-5 text-[#9CA3AF]" />
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red">{error}</p>}
    </div>
  );
};

export default DatePickerOne;
