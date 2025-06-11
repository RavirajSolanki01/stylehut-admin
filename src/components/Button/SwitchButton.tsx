import React from "react";
import { useState } from "react";

interface SwitchButtonProps {
  enabled?: boolean;
  onChange?: (enabled: boolean) => void;
  label?: string;
  title?: string;
  leftText?: string;
  rightText?: string;
  showColor?: boolean;
  name?: string;
}

const SwitchButton: React.FC<SwitchButtonProps> = ({
  // enabled: initialEnabled = false,
  enabled = false,
  onChange,
  label = "",
  title = "",
  leftText = "",
  rightText = "",
  name = "",
  showColor = true,
}) => {
  // const [enabled, setEnabled] = useState(initialEnabled);

  const handleToggle = () => {

    // const newState = !enabled;
    // setEnabled(newState);
    // onChange?.(newState);
  };

  return (
    <div className="mb-2 flex items-center gap-2">
      <button
        name={name}
        title={title}
        onClick={handleToggle}
        type="button"
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
          showColor ? (enabled ? "bg-primary" : "bg-gray-300") : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute left-1 inline-flex h-4 w-4 items-center justify-center text-[10px] font-medium transition-all duration-300 ${
            enabled ? "opacity-30" : "rounded-full bg-white opacity-100"
          }`}
        >
          {leftText}
        </span>
        <span
          className={`absolute right-1 inline-flex h-4 w-4 items-center justify-center text-[10px] font-medium transition-all duration-300 ${
            enabled ? "rounded-full bg-white opacity-100" : "opacity-30"
          }`}
        >
          {rightText}
        </span>
      </button>
      {label && <span>{label}</span>}
    </div>
  );
};

export default SwitchButton;
