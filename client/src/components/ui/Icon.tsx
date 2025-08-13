interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export const Icon = ({ name, size = 20, className = "" }: IconProps) => {
  // Using Material Symbols - replace with your icon system
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontSize: size }}
    >
      {name}
    </span>
  );
};
