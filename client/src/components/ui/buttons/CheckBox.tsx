// components/ui/Checkbox.tsx
import * as React from "react";

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
  size?: number;
  color?: Text;
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
      className={`w-${size} aspect-square accent-[${color}] ${className ?? ""}`}
    />
  );
};

export default Checkbox;
