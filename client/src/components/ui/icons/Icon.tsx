interface IconProps {
  name: string;
  size?: number;
  className?: string;
  isFilled?: boolean;
}

export const Icon = ({
  name,
  size = 20,
  className = "",
  isFilled = false,
}: IconProps) => {
  // Using Material Symbols - replace with your icon system
  return (
    <span
      className={`material-symbols-outlined ${
        isFilled && "filled"
      } ${className}`}
      style={{ fontSize: size }}
    >
      {name}
    </span>
  );
};
