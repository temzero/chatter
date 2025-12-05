// components/ui/Checkbox.tsx
import * as React from "react";

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
  size?: number;
  color?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  className,
  size = 4,
  color = "var(--primary-green)",
}) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{ accentColor: color }}
      className={`w-${size} aspect-square ${className ?? ""}`}
    />
  );
};

export default Checkbox;
