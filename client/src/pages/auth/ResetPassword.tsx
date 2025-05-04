import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthenticationLayout } from "./AuthenticationLayout";
import { motion } from "framer-motion";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPasswordWithToken } = useAuth();
  const { token } = useParams();
  const navigate = useNavigate();

  console.log("token: ", token);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    if (!token) {
      return setError("Invalid reset token");
    }

    try {
      setError(""); // Reset error
      setSuccess(""); // Reset success
      setLoading(true);

      // Call resetPasswordWithToken from the context
      await resetPasswordWithToken(token, password);

      // Success success
      setSuccess(
        "Password successfully reset. You can now login with your new password."
      );

      // Redirect to login page after 3 seconds
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError("Failed to reset password");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthenticationLayout>
      <motion.div
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center rounded-lg custom-border backdrop-blur-md bg-[var(--card-bg-color)]"
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center w-[400px] gap-2 p-8"
        >
          <h2 className="text-4xl font-semibold mb-4 text-center">Reset Password</h2>
          <input
            type="password"
            id="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input backdrop-blur-lg"
            autoFocus
          />
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="input backdrop-blur-lg"
          />
          {error && <div className="text-red-400 -mb-1">{error}</div>}
          {success && <div className="text-green-400 -mb-1">{success}</div>}
          <button
            type="submit"
            disabled={loading}
            className="primary w-full py-1 mt-2"
          >
            {loading ? "Processing..." : "Reset Password"}
          </button>
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
