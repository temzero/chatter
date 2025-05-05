import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthenticationLayout } from "../PublicLayout";
import { motion } from "framer-motion";

const VerifyEmail = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { verifyEmailWithToken } = useAuth();
  const { first_name, email, token } = useParams();
  const navigate = useNavigate();

  console.log("first name:", first_name);
  console.log("email:", email);
  console.log("token:", token);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      return setError("Invalid verification token.");
    }

    try {
      setError("");
      setSuccess("");
      setLoading(true);

      await verifyEmailWithToken(token);

      setSuccess("Email successfully verified. You can now log in.");

      setTimeout(() => navigate("/auth/login"), 2000);
    } catch (err) {
      setError("Failed to verify email.");
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
          <h2 className="text-4xl font-semibold mb-4 text-center">
            Verify Email
          </h2>
          <div className="opacity-80 py-2 flex flex-col items-center justify-center">
            <p>
              Hi <strong>{first_name}!</strong>
            </p>
            <p>Please confirm that this is your email address</p>
            <div className="text-green-400 flex items-center gap-1 font-semibold mt-2">
              <span className="material-symbols-outlined">mail</span>
              {email}
            </div>
          </div>
          {error && (
            <div className="text-red-400 text-center -mb-1">{error}</div>
          )}
          {success && (
            <div className="text-green-400 text-center -mb-1">{success}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="primary w-full py-1 mt-2"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>
      </motion.div>
    </AuthenticationLayout>
  );
};

export default VerifyEmail;
