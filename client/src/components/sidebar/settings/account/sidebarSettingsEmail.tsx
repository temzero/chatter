import React, { useState, useEffect } from "react";
import SidebarLayout from "@/pages/SidebarLayout";
import { SidebarMode } from "@/types/enums/sidebarMode";
import { useAuthStore } from "@/stores/authStore";
import { userService } from "@/services/userService";
import { useSidebarStore } from "@/stores/sidebarStore";
import axios from "axios";

type MessageType = "error" | "success" | "info";

interface Message {
  type: MessageType;
  content: string;
}

const SidebarSettingsEmail: React.FC = () => {
  const { setSidebar } = useSidebarStore();
  const currentUser = useAuthStore((state) => state.currentUser);
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const [email, setEmail] = useState(currentUser?.email || "");
  const [verificationCode, setVerificationCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [codeCountdown, setCodeCountdown] = useState(0);
  const isUnchanged = email === currentUser?.email;
  const isDisabled = loading || !isValid || isUnchanged;

  const clearMessage = () => setMessage(null);

  // Validate email whenever it changes
  useEffect(() => {
    if (!email) {
      setIsValid(false);
      setValidationError("");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setIsValid(false);
      setValidationError("Please enter a valid email address");
      return;
    }

    if (email.length > 254) {
      setIsValid(false);
      setValidationError("Email must be no more than 254 characters");
      return;
    }

    setIsValid(true);
    setValidationError("");
  }, [email]);

  // Handle countdown timer
  useEffect(() => {
    if (codeCountdown <= 0) return;

    const timer = setTimeout(() => {
      setCodeCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [codeCountdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage({ type: "error", content: "Email cannot be empty" });
      return;
    }

    if (!isValid) {
      setMessage({
        type: "error",
        content: validationError || "Invalid email format",
      });
      return;
    }

    try {
      setLoading(true);
      clearMessage();

      if (email === currentUser?.email) {
        setMessage({
          type: "info",
          content: "This is already your current email",
        });
        return;
      }

      await userService.sendEmailVerificationCode(email);
      setShowCodeInput(true);
      setCodeCountdown(120); // 2 minutes countdown
      setMessage({
        type: "info",
        content: "Verification code sent to your email",
      });
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        content:
          error instanceof Error
            ? error.message
            : "Failed to send verification code",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setMessage({ type: "error", content: "Please enter a 6-digit code" });
      return;
    }

    try {
      setLoading(true);
      clearMessage();

      const updatedUser = await userService.updateEmailWithCode(
        email,
        verificationCode
      );
      setCurrentUser(updatedUser);
      setMessage({
        type: "success",
        content: "Email verified and updated successfully",
      });
      setShowCodeInput(false);
      setVerificationCode("");
      setSidebar(SidebarMode.PROFILE);
    } catch (error) {
      console.error("error from client: ", error);
      let errorMessage = "Email verification failed";

      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      setMessage({ type: "error", content: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (codeCountdown > 0) return;

    try {
      setLoading(true);
      clearMessage();

      await userService.sendEmailVerificationCode(email);
      setCodeCountdown(120); // Reset to 2 minutes
      setMessage({
        type: "info",
        content: "Verification code resent to your email",
      });
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        content:
          error instanceof Error ? error.message : "Failed to resend code",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
          disabled={loading || showCodeInput}
          name="email"
          placeholder="Set New Email"
          className="input"
          autoComplete="email"
          autoFocus
        />

        {validationError && (
          <div className="text-sm text-red-600">{validationError}</div>
        )}

        {!showCodeInput ? (
          <button
            type="submit"
            className={`${isDisabled ? "" : "primary"} p-1 w-full`}
            disabled={isDisabled}
          >
            {loading ? "Sending..." : "Send Email Verification"}
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="relative flex items-center gap-2 border-2 border-[var(--input-border-color)] p-2 rounded">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(
                    e.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                placeholder="Enter code"
                className="border-4 border-bottom text-3xl"
                inputMode="numeric"
                pattern="\d{6}"
                disabled={loading}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="primary p-1 flex-1"
                onClick={handleVerifyCode}
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
              {codeCountdown > 0 ? (
                <button type="button" className="secondary p-1 flex-1" disabled>
                  Resend in {formatCountdown(codeCountdown)}
                </button>
              ) : (
                <button
                  type="button"
                  className="secondary p-1 flex-1"
                  onClick={handleResendCode}
                  disabled={loading}
                >
                  Resend Code
                </button>
              )}
            </div>
          </div>
        )}

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
