import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { AlertMessage } from "@/components/ui/AlertMessage";
import { AuthenticationLayout } from "../PublicLayout";
import { motion } from "framer-motion";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    password: "",
    confirmPassword: ""
  });

  const register = useAuthStore(state => state.register);
  const setMessage = useAuthStore(state => state.setMessage);
  const loading = useAuthStore(state => state.loading);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setMessage("error", "Passwords do not match!");
    }

    await register({
      email: formData.email,
      username: formData.username,
      first_name: formData.first_name,
      last_name: formData.last_name,
      password: formData.password,
    });
    navigate("/");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: id === "first_name" || id === "last_name" 
        ? value.charAt(0).toUpperCase() + value.slice(1) 
        : value
    }));
  };

  return (
    <AuthenticationLayout>
      <motion.div
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center rounded-lg custom-border backdrop-blur-md bg-[var(--card-bg-color)] mt-20"
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center w-[400px] gap-2 p-8"
        >
          <h2 className="text-4xl font-semibold mb-4">Register</h2>
          <input
            type="text"
            id="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="input backdrop-blur-lg"
            autoFocus
          />

          <div className="flex gap-2">
            <input
              type="text"
              id="first_name"
              placeholder="First Name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="input backdrop-blur-lg"
            />

            <input
              type="text"
              id="last_name"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="input backdrop-blur-lg"
            />
          </div>

          <input
            type="email"
            id="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input backdrop-blur-lg"
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

          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
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
            {loading ? "Creating account..." : "Register"}
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

export default Register;