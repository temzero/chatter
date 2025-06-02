// Toggle.tsx
import React from "react";

interface ToggleProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  enabled,
  setEnabled,
  disabled = false,
  className = "",
}) => {
  const toggle = () => {
    if (!disabled) {
      setEnabled(!enabled);
    }
  };

  return (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
        ${enabled ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-600"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}`}
      onClick={toggle}
      disabled={disabled}
      aria-pressed={enabled}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${enabled ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
};

export default Toggle;
