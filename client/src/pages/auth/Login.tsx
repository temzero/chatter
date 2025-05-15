import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { AlertMessage } from "@/components/ui/AlertMessage";
import { AuthenticationLayout } from "../PublicLayout";
import { motion } from "framer-motion";
import { QRCode } from "@/components/ui/QRCode";
import qrCode from "@/assets/icon/qr-code.svg";

const Login = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [showQrCode, setShowQrCode] = useState(false);
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const identifier = formData.get("identifier") as string;
    const password = formData.get("password") as string;

    await login(identifier, password);
    navigate("/");
  };

  const toggleQrCode = () => {
    setShowQrCode(!showQrCode);
  };

  return (
    <AuthenticationLayout showExampleButton loading={loading}>
      <motion.div
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center rounded-lg custom-border backdrop-blur-md bg-[var(--card-bg-color)] overflow-hidden"
      >
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col justify-center w-[400px] gap-2 p-8"
        >
          <h2 className="text-4xl font-semibold mb-4">Login</h2>

          <input
            type="text"
            name="identifier"
            placeholder="Username, Email, or Phone Number"
            required
            className="input backdrop-blur-lg"
            autoComplete="username"
            autoFocus
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="input backdrop-blur-lg"
            autoComplete="current-password"
          />

          <AlertMessage className="-mb-1" />

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="primary w-full py-1 mt-2"
          >
            {loading ? "Logging in..." : "Log In"}
          </motion.button>

          <div className="flex items-center justify-between gap-4 mt-2">
            <Link
              to="/auth/register"
              className="opacity-40 hover:opacity-100 hover:text-green-400"
            >
              Register
            </Link>
            <Link
              to="/auth/forgot-password"
              className="opacity-40 hover:opacity-100 hover:text-green-400"
            >
              Forgot Password?
            </Link>
          </div>
        </form>

        <motion.div
          className="h-full p-6 flex flex-1 flex-col gap-3 justify-end custom-border-l cursor-pointer select-none"
          onClick={toggleQrCode}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <h1 className="text-xl font-semibold text-center">Scan to login</h1>
          {showQrCode ? (
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="w-[200px] rounded"
              src={qrCode}
              alt="Chatter Logo"
            />
          ) : (
            <QRCode className="w-[200px]" />
          )}
        </motion.div>
      </motion.div>
    </AuthenticationLayout>
  );
};

export default Login;
