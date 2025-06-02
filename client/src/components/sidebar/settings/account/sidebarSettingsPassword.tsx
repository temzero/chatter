import React, { useState, useEffect } from "react";
import SidebarLayout from "@/pages/SidebarLayout";
import { SidebarMode } from "@/types/enums/sidebarMode";
import { useAuthStore } from "@/stores/authStore";
import { userService } from "@/services/userService";
import { useSidebarStore } from "@/stores/sidebarStore";

interface Message {
  type: "error" | "success" | "info";
  content: string;
}

const SidebarSettingsPassword: React.FC = () => {
  const setLoading = useAuthStore((state) => state.setLoading);
  const loading = useAuthStore((state) => state.loading);
  const { setSidebar } = useSidebarStore();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [localMessage, setLocalMessage] = useState<Message | null>(null);

  const isDisabled =
    loading || !isValid || !currentPassword || !newPassword || !confirmPassword;

  const clearMessage = () => {
    setLocalMessage(null);
  };

  // Validate password whenever it changes
  useEffect(() => {
    if (!newPassword) {
      setIsValid(false);
      setValidationError("");
      return;
    }

    // Password requirements
    if (newPassword.length < 8) {
      setIsValid(false);
      setValidationError("Password must be at least 8 characters");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setIsValid(false);
      setValidationError("Password must contain at least one uppercase letter");
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setIsValid(false);
      setValidationError("Password must contain at least one lowercase letter");
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setIsValid(false);
      setValidationError("Password must contain at least one number");
      return;
    }

    if (newPassword !== confirmPassword) {
      setIsValid(false);
      setValidationError("Passwords do not match");
      return;
    }

    // If all checks pass
    setIsValid(true);
    setValidationError("");
  }, [newPassword, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setLocalMessage({ type: "error", content: "All fields are required" });
      return;
    }

    if (!isValid) {
      setLocalMessage({
        type: "error",
        content: validationError || "Invalid password format",
      });
      return;
    }

    try {
      setLoading(true);
      clearMessage();

      const response = await userService.changePassword(
        currentPassword,
        newPassword
      );

      if (response.payload) {
        setLocalMessage({
          type: "success",
          content: "Password changed successfully",
        });
        // Clear form after successful change
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSidebar(SidebarMode.SETTINGS_ACCOUNT);
      } else {
        setLocalMessage({
          type: "error",
          content: response.message || "Failed to change password",
        });
      }
    } catch (error) {
      console.error(error);
      setLocalMessage({
        type: "error",
        content:
          error instanceof Error ? error.message : "Failed to change password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout
      title="Change Password"
      backLocation={SidebarMode.SETTINGS_ACCOUNT}
    >
      <form onSubmit={handleSubmit} className="p-2 flex flex-col gap-2">
        <div className="w-full p-4 rounded-lg bg-[var(--hover-color)]">
          <h3 className="font-semibold mb-2">Password Requirements:</h3>
          <ul className="space-y-1 dark:text-gray-300">
            <li>• At least 8 characters</li>
            <li>• At least one uppercase letter</li>
            <li>• At least one lowercase letter</li>
            <li>• At least one number</li>
            <li>• New passwords must match</li>
          </ul>
        </div>

        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          disabled={loading}
          name="currentPassword"
          placeholder="Current Password"
          className="input"
          autoComplete="current-password"
          autoFocus
        />

        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={loading}
          name="newPassword"
          placeholder="New Password"
          className="input"
          autoComplete="new-password"
        />

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          name="confirmPassword"
          placeholder="Confirm New Password"
          className="input"
          autoComplete="new-password"
        />

        {validationError && (
          <div className="text-sm text-red-600">{validationError}</div>
        )}

        {localMessage && (
          <div
            className={`text-sm ${
              localMessage.type === "error"
                ? "text-red-600"
                : localMessage.type === "success"
                ? "text-green-600"
                : "text-blue-600"
            }`}
          >
            {localMessage.content}
          </div>
        )}

        <button
          type="submit"
          className={`${isDisabled ? "" : "primary"} p-1 w-full`}
          disabled={isDisabled}
        >
          {loading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </SidebarLayout>
  );
};

export default SidebarSettingsPassword;
