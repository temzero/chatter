import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthenticationLayout } from "./AuthenticationLayout";
import { motion } from "framer-motion";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { sendPasswordResetEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");
      setLoading(true);
      await sendPasswordResetEmail(email);
      setSuccess("Check your inbox for further instructions");
    } catch (err) {
      setError("Failed to send reset password link");
      console.error(err);
    }
    setLoading(false);
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
          <h2 className="text-4xl font-semibold text-center mb-6">
            Forgot Password
          </h2>
          <input
            type="email"
            id="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input backdrop-blur-lg"
            autoFocus
          />
          {error && <div className="text-red-400 -mb-1">{error}</div>}
          {success && <div className="text-green-400 -mb-1">{success}</div>}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="primary w-full py-1 mt-2"
          >
            {loading ? "Processing..." : "Send Reset Password Link"}
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

export default ForgotPassword;
