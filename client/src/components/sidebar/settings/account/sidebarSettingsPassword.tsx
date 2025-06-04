// export default SidebarSettingsPassword;
import React, { useState, useEffect } from "react";
import SidebarLayout from "@/pages/SidebarLayout";
import { SidebarMode } from "@/types/enums/sidebarMode";
import { useAuthStore } from "@/stores/authStore";
import { userService } from "@/services/userService";
import { useSidebarStore } from "@/stores/sidebarStore";
import { toast } from "react-toastify";
import { handleError } from "@/utils/handleError";

const SidebarSettingsPassword: React.FC = () => {
  const setLoading = useAuthStore((state) => state.setLoading);
  const loading = useAuthStore((state) => state.loading);
  const { setSidebar } = useSidebarStore();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isValid, setIsValid] = useState(false);

  const isDisabled =
    loading || !isValid || !currentPassword || !newPassword || !confirmPassword;

  // Validate password whenever it changes
  useEffect(() => {
    if (!newPassword) {
      setIsValid(false);
      return;
    }

    // Password requirements
    if (newPassword.length < 8) {
      setIsValid(false);
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setIsValid(false);
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setIsValid(false);
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setIsValid(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setIsValid(false);
      return;
    }

    // If all checks pass
    setIsValid(true);
  }, [newPassword, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (!isValid) {
      toast.error("Invalid password format");
      return;
    }

    try {
      setLoading(true);

      const response = await userService.changePassword(
        currentPassword,
        newPassword
      );

      if (response.payload) {
        toast.success("Password changed successfully");
        // Clear form after successful change
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSidebar(SidebarMode.SETTINGS_ACCOUNT);
      } else {
        toast.error(response.message || "Failed to change password");
      }
    } catch (error) {
      handleError(error, 'Failed to change password')
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
