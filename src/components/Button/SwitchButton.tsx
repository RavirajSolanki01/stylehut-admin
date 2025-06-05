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
}

const SwitchButton: React.FC<SwitchButtonProps> = ({
  enabled: initialEnabled = false,
  onChange,
  label = "",
  title = "",
  leftText = "",
  rightText = "",
  showColor = true
}) => {
  const [enabled, setEnabled] = useState(initialEnabled);

  const handleToggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    onChange?.(newState);
  };

  return (
    <div className="mb-2 flex items-center gap-2">
      <button
        title={title}
        onClick={handleToggle}
        type="button"
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
          showColor ? (enabled ? "bg-primary" : "bg-gray-300") : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute left-1 inline-flex h-4 w-4 items-center justify-center text-[10px] font-medium transition-all duration-300 ${
            enabled ? "opacity-30" : "opacity-100 bg-white rounded-full"
          }`}
        >
          {leftText}
        </span>
        <span
          className={`absolute right-1 inline-flex h-4 w-4 items-center justify-center text-[10px] font-medium transition-all duration-300 ${
            enabled ? "opacity-100 bg-white rounded-full" : "opacity-30"
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
