import { useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { AlertMessage } from "@/components/ui/AlertMessage";
import { AuthenticationLayout } from "../PublicLayout";
import { motion } from "framer-motion";
import { publicLayoutAnimations } from "@/animations/publicLayoutAnimations";

const ResetPassword = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const { token } = useParams();
  const loading = useAuthStore((state) => state.loading);
  const resetPasswordWithToken = useAuthStore(
    (state) => state.resetPasswordWithToken
  );
  const setMessage = useAuthStore((state) => state.setMessage);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      return setMessage("error", "Passwords do not match");
    }

    if (!token) {
      return setMessage("error", "Invalid reset token");
    }

    await resetPasswordWithToken(token, password);
    setTimeout(() => navigate("/auth/login"), 2000);
  };

  return (
    <AuthenticationLayout>
      <motion.div
        {...publicLayoutAnimations.container}
        className="flex items-center rounded-lg custom-border backdrop-blur-md bg-[var(--card-bg-color)]"
      >
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col justify-center w-[400px] gap-2 p-8"
        >
          <h2 className="text-4xl font-semibold mb-4 text-center">
            Reset Password
          </h2>

          <input
            type="password"
            name="password"
            placeholder="New Password"
            required
            className="input"
            autoFocus
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            required
            className="input"
          />

          <AlertMessage className="-mb-1" />

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="primary w-full py-1 mt-2"
          >
            {loading ? "Processing..." : "Reset Password"}
          </motion.button>

          <div className="flex items-center gap-4 mt-2">
            <Link
              to="/auth/login"
              className="opacity-40 hover:opacity-100 hover:text-green-400"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </motion.div>
    </AuthenticationLayout>
  );
};

export default ResetPassword;
