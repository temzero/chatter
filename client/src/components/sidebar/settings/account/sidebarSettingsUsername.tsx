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

const SidebarSettingsUsername: React.FC = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const [loading, setLoading] = useState(false);
  const [localMessage, setLocalMessage] = useState<Message | null>(null);

  const [username, setUsername] = useState(currentUser?.username || "");
  const [isValid, setIsValid] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false); // New state for tracking availability
  const { setSidebar } = useSidebarStore();

  const isUnchanged = username === currentUser?.username;
  const isDisabled = loading || !isValid || isUnchanged;

  // Validate username whenever it changes
  useEffect(() => {
    if (!username) {
      setIsValid(false);
      setValidationError("");
      return;
    }

    // Check length
    if (username.length < 3) {
      setIsValid(false);
      setValidationError("Username must be at least 3 characters");
      return;
    }

    if (username.length > 30) {
      setIsValid(false);
      setValidationError("Username must be no more than 30 characters");
      return;
    }

    // Check allowed characters
    const validChars = /^[a-zA-Z0-9._]+$/;
    if (!validChars.test(username)) {
      setIsValid(false);
      setValidationError(
        "Only letters, numbers, periods (.) and underscores (_) are allowed"
      );
      return;
    }

    // Check for spaces
    if (/\s/.test(username)) {
      setIsValid(false);
      setValidationError("Spaces are not allowed");
      return;
    }

    // Check if ends with period
    if (username.endsWith(".")) {
      setIsValid(false);
      setValidationError("Username cannot end with a period");
      return;
    }

    // Check for consecutive periods
    if (/\.{2,}/.test(username)) {
      setIsValid(false);
      setValidationError("Username cannot contain consecutive periods");
      return;
    }

    // If all checks pass
    setIsValid(true);
    setValidationError("");
  }, [username]);

  const clearMessage = () => {
    setLocalMessage(null);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setLocalMessage({ type: "error", content: "Username cannot be empty" });
      return;
    }

    if (!isValid) {
      setLocalMessage({
        type: "error",
        content: validationError || "Invalid username format",
      });
      return;
    }

    try {
      setLoading(true);
      clearMessage();
      setIsAvailable(false); // Reset availability state

      // Check if username is the same as current
      if (username === currentUser?.username) {
        setLocalMessage({
          type: "info",
          content: "This is already your current username",
        });
        setIsVerified(false);
        return;
      }

      // Verify username availability
      const data = await userService.verifyUsername(username);
      console.log("data: ", data);

      let type: Message["type"] = "error"; // default type
      if (data.payload) {
        type = "success";
        setIsAvailable(true); // Only set to true if payload is true
      }

      setLocalMessage({ type, content: data.message });
      setIsVerified(true);
    } catch (error) {
      console.error(error);
      setLocalMessage({
        type: "error",
        content:
          error instanceof Error ? error.message : "Username is not available",
      });
      setIsVerified(false);
      setIsAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isVerified || !isAvailable) {
      setLocalMessage({
        type: "error",
        content: "Please verify your username first and ensure it's available",
      });
      return;
    }

    try {
      setLoading(true);
      clearMessage();

      // Update username
      const updatedUser = await userService.updateUsername(username);
      setCurrentUser(updatedUser);
      setLocalMessage({
        type: "success",
        content: "Username updated successfully!",
      });
      setIsVerified(false); // Reset verification state after update
      setIsAvailable(false); // Reset availability state after update
      setSidebar(SidebarMode.SETTINGS_ACCOUNT)
    } catch (error) {
      console.error(error);
      setLocalMessage({
        type: "error",
        content:
          error instanceof Error ? error.message : "Failed to update username",
      });
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
            <li>• 3–30 characters</li>
            <li>
              • Letters (A-Z), numbers (0-9), periods (.) or underscores (_)
            </li>
            <li>• No spaces or special characters</li>
            <li>• Cannot end with a period (.)</li>
            <li>• Cannot contain consecutive periods (..)</li>
            <li>• Must be unique</li>
          </ul>
        </div>

        <input
          type="text"
          value={username}
          onChange={(e) => {
            const value = e.target.value;
            setUsername(value.toLowerCase());
            setIsVerified(false); // Reset verification when username changes
            setIsAvailable(false); // Reset availability when username changes
          }}
          disabled={loading}
          name="identifier"
          placeholder="Set New Username"
          className="input"
          autoComplete="username"
          autoFocus
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
          className={`${isDisabled ? "" : "text-green-400"} p-1 w-full`}
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
