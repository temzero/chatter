import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SidebarLayout from "@/pages/SidebarLayout";
import { SidebarMode } from "@/types/enums/sidebarMode";
import { useAuthStore } from "@/stores/authStore";
import { userService } from "@/services/userService";
import { useSidebarStore } from "@/stores/sidebarStore";
import { handleError } from "@/utils/handleError";

const SidebarSettingsUsername: React.FC = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(currentUser?.username || "");
  const [isValid, setIsValid] = useState(false);
  const [ErrorMessage, setErrorMessage] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const { setSidebar } = useSidebarStore();

  const isUnchanged = username === currentUser?.username;
  const isDisabled = loading || !isValid || isUnchanged;

  // Validate username whenever it changes
  useEffect(() => {
    if (!username) {
      setIsValid(false);
      setErrorMessage("");
      return;
    }

    if (username.length > 30) {
      setIsValid(false);
      setErrorMessage("Username must be no more than 30 characters");
      return;
    }

    const validChars = /^[a-zA-Z0-9._]+$/;
    if (!validChars.test(username)) {
      setIsValid(false);
      setErrorMessage(
        "Only letters, numbers, periods (.) and underscores (_) are allowed"
      );
      return;
    }

    if (/\s/.test(username)) {
      setIsValid(false);
      setErrorMessage("Spaces are not allowed");
      return;
    }

    if (username.endsWith(".")) {
      setIsValid(false);
      setErrorMessage("Username cannot end with a period");
      return;
    }

    if (/\.{2,}/.test(username)) {
      setIsValid(false);
      setErrorMessage("Username cannot contain consecutive periods");
      return;
    }

    setIsValid(true);
    setErrorMessage("");
  }, [username]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    if (!isValid) {
      toast.error("Please fix validation errors first");
      return;
    }

    try {
      setLoading(true);
      setIsAvailable(false);

      if (username === currentUser?.username) {
        setIsVerified(false);
        toast.info("This is already your current username");
        return;
      }

      const data = await userService.verifyUsername(username);

      if (data.payload) {
        setIsAvailable(true);
        toast.success("Username is available!");
      } else {
        toast.error("Username is already taken");
      }
      setIsVerified(true);
    } catch (error) {
      setIsVerified(false);
      setIsAvailable(false);
      handleError(error, "Failed to update username");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isVerified || !isAvailable) {
      toast.error("Please verify username availability first");
      return;
    }

    try {
      setLoading(true);

      const updatedUser = await userService.updateUsername(username);
      setCurrentUser(updatedUser);
      setIsVerified(false);
      setIsAvailable(false);
      toast.success("Username updated successfully!");
      setSidebar(SidebarMode.SETTINGS_ACCOUNT);
    } catch (error) {
      handleError(error, "Failed to update username");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout
      title="Change Username"
      backLocation={SidebarMode.SETTINGS_ACCOUNT}
    >
      <form onSubmit={handleVerify} className="p-2 flex flex-col gap-2">
        <div className="w-full p-4 rounded-lg bg-[var(--hover-color)]">
          <h3 className="font-semibold mb-2">Username Requirements:</h3>
          <ul className="space-y-1 dark:text-gray-300">
            <li>• Maximum 24 characters</li>
            <li>
              • Letters (A-Z), numbers (0-9), periods (.) or underscores (_)
            </li>
            <li>• No spaces or special characters</li>
            <li>• Cannot end with a period (.)</li>
            <li>• Cannot contain consecutive periods (..)</li>
            <li>• Must be unique</li>
          </ul>
        </div>

        <div className="input flex items-center justify-between">
          <input
            type="text"
            value={username}
            maxLength={24}
            onChange={(e) => {
              const value = e.target.value;
              setUsername(value.toLowerCase());
              setIsVerified(false);
              setIsAvailable(false);
            }}
            disabled={loading}
            name="identifier"
            placeholder="Set New Username"
            className="flex-1"
            autoComplete="username"
            autoFocus
          />
          {isVerified &&
            (isAvailable ? (
              <span className="material-symbols-outlined text-green-500 -mr-1">
                check_circle
              </span>
            ) : (
              <span className="material-symbols-outlined text-red-500 -mr-1">
                cancel
              </span>
            ))}
        </div>

        {ErrorMessage && (
          <div className="text-sm text-red-600">{ErrorMessage}</div>
        )}

        <button
          type="submit"
          className={`${
            isDisabled ? "" : "text-green-400 bg-[var(--border-color)]"
          } p-1 w-full`}
          disabled={isDisabled}
        >
          {loading && !isVerified ? "Verifying..." : "Verify"}
        </button>

        {isVerified && isAvailable && (
          <button
            type="button"
            onClick={handleSubmitUpdate}
            className="primary p-1 w-full"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Username"}
          </button>
        )}
      </form>
    </SidebarLayout>
  );
};

export default SidebarSettingsUsername;
