import React, { useState, useEffect } from "react";
import SidebarLayout from "@/pages/SidebarLayout";
import { SidebarMode } from "@/types/enums/sidebarMode";
import { useAuthStore } from "@/stores/authStore";
import { userService } from "@/services/userService";

const SidebarSettingsEmail: React.FC = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const setMessage = useAuthStore((state) => state.setMessage);
  const setLoading = useAuthStore((state) => state.setLoading);
  const clearMessage = useAuthStore((state) => state.clearMessage);
  const loading = useAuthStore((state) => state.loading);
  const message = useAuthStore((state) => state.message);

  const [email, setEmail] = useState(currentUser?.email || "");
  const [isValid, setIsValid] = useState(false);
  const [validationError, setValidationError] = useState("");
  const isUnchanged = email === currentUser?.email;
  const isDisabled = loading || !isValid || isUnchanged;

  // Validate email whenever it changes
  useEffect(() => {
    if (!email) {
      setIsValid(false);
      setValidationError("");
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setIsValid(false);
      setValidationError("Please enter a valid email address");
      return;
    }

    // Check length
    if (email.length > 254) {
      setIsValid(false);
      setValidationError("Email must be no more than 254 characters");
      return;
    }

    // If all checks pass
    setIsValid(true);
    setValidationError("");
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage("error", "Email cannot be empty");
      return;
    }

    if (!isValid) {
      setMessage("error", validationError || "Invalid email format");
      return;
    }

    try {
      setLoading(true);
      clearMessage();

      // Check if email is the same as current
      if (email === currentUser?.email) {
        setMessage("info", "This is already your current email");
        return;
      }

      const updatedUser = await userService.sendEmailVerification(email);
      setCurrentUser(updatedUser);
      setMessage("success", "Email updated successfully");
    } catch (error) {
      console.error(error);
      setMessage(
        "error",
        error instanceof Error ? error.message : "Failed to update email"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout
      title="Change Email"
      backLocation={SidebarMode.SETTINGS_ACCOUNT}
    >
      <form onSubmit={handleSubmit} className="p-2 flex flex-col gap-2">
        <div className="w-full p-4 rounded-lg bg-[var(--hover-color)]">
          <h3 className="font-semibold mb-2">Email Requirements:</h3>
          <ul className="space-y-1 dark:text-gray-300">
            <li>• Must be a valid email address</li>
            <li>• Maximum 254 characters</li>
            <li>• Must be unique (not used by another account)</li>
            <li>• You need to verify the new email address</li>
          </ul>
        </div>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value.trim())}
          disabled={loading}
          name="email"
          placeholder="Set New Email"
          className="input"
          autoComplete="email"
          autoFocus
        />

        {validationError && (
          <div className="text-sm text-red-600">{validationError}</div>
        )}

        <button
          type="submit"
          className={`${isDisabled ? "" : "primary"} p-1 w-full`}
          disabled={isDisabled}
        >
          {loading ? "Sending..." : "Send Email Verification"}
        </button>

        {message && (
          <div
            className={`text-sm ${
              message.type === "error"
                ? "text-red-600"
                : message.type === "success"
                ? "text-green-600"
                : "text-blue-600"
            }`}
          >
            {message.content}
          </div>
        )}
      </form>
    </SidebarLayout>
  );
};

export default SidebarSettingsEmail;
