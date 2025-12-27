import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps {
  id?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PasswordField = ({
  id = "password",
  name = "password",
  placeholder = "Password",
  required = true,
  autoComplete = "current-password",
  autoFocus = false,
  disabled = false,
  className = "",
  value,
  onChange,
}: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        required={required}
        className={`input-field pr-10 ${className}`}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
        aria-label={showPassword ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="w-5 h-5" />
        ) : (
          <Eye className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};
