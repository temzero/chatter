import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { AlertMessage } from "@/components/ui/AlertMessage";
import { AuthenticationLayout } from "../PublicLayout";
import { motion } from "framer-motion";
import { QRCode } from "@/components/ui/QRCode";
import qrCode from "@/assets/icon/qr-code.svg";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  
  const [showQrCode, setShowQrCode] = useState(false);
  
  const login = useAuthStore(state => state.login);
  const loading = useAuthStore(state => state.loading);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData.email, formData.password);
    navigate("/");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
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
          onSubmit={handleSubmit}
          className="flex flex-col justify-center w-[400px] gap-2 p-8"
        >
          <h2 className="text-4xl font-semibold mb-4">Login</h2>

          <input
            type="email"
            id="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input backdrop-blur-lg"
            autoFocus
          />

          <input
            type="password"
            id="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="input backdrop-blur-lg"
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