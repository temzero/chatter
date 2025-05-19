import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { AlertMessage } from "@/components/ui/AlertMessage";
import { AuthenticationLayout } from "../PublicLayout";
import { motion } from "framer-motion";

const Register = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  
  const register = useAuthStore(state => state.register);
  const setMessage = useAuthStore(state => state.setMessage);
  const loading = useAuthStore(state => state.loading);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formRef.current) return;
    
    const formData = new FormData(formRef.current);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      return setMessage("error", "Passwords do not match!");
    }

    await register({
      email: formData.get("email") as string,
      username: formData.get("username") as string,
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      password: password,
    });
    navigate("/");
  };

  const capitalizeFirstLetter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, selectionStart } = e.target;
    if (value.length === 1) {
      e.target.value = value.charAt(0).toUpperCase() + value.slice(1);
      // Move cursor to end after capitalization
      e.target.setSelectionRange(selectionStart, selectionStart);
    }
  };

  return (
    <AuthenticationLayout>
      <motion.div
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center rounded-lg custom-border backdrop-blur-md bg-[var(--card-bg-color)] mt-20"
      >
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col justify-center w-[400px] gap-2 p-8"
        >
          <h2 className="text-4xl font-semibold mb-4">Register</h2>
          <input
            type="text"
            name="username"
            placeholder="Username"
            required
            className="input"
            autoComplete="username"
            autoFocus
          />

          <div className="flex gap-2">
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              required
              className="input"
              ref={firstNameRef}
              onChange={capitalizeFirstLetter}
            />

            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              required
              className="input"
              ref={lastNameRef}
              onChange={capitalizeFirstLetter}
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="input"
            autoComplete="email"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="input"
            autoComplete="new-password"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            required
            className="input"
            autoComplete="new-password"
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