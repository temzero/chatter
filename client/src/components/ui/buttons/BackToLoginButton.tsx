import { Link } from "react-router-dom";
import clsx from "clsx";

interface BackToLoginButtonProps {
  className?: string;
  label?: string;
  to?: string;
}

export const BackToLoginButton = ({
  className,
  label = "Back to login",
  to = "/auth/login",
}: BackToLoginButtonProps) => {
  return (
    <Link
      to={to}
      className={clsx(
        "text-2xl!",
        "inline-flex items-center opacity-40 transition-all mt-2",
        "hover:opacity-100 hover:text-green-400",
        "select-none",
        className
      )}
    >
      <span className="material-symbols-outlined">arrow_back</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};
