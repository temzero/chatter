import React, { useState, useEffect } from "react";
import SidebarLayout from "@/pages/SidebarLayout";
import { SidebarMode } from "@/types/enums/sidebarMode";
import { useAuthStore } from "@/stores/authStore";
import { userService } from "@/services/userService";
import { useSidebarStore } from "@/stores/sidebarStore";
import { handleError } from "@/utils/handleError";
import { toast } from "react-toastify";

const SidebarSettingsEmail: React.FC = () => {
  const { setSidebar } = useSidebarStore();
  const currentUser = useAuthStore((state) => state.currentUser);
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState(currentUser?.email || "");
  const [verificationCode, setVerificationCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [codeCountdown, setCodeCountdown] = useState(0);
  const isUnchanged = email === currentUser?.email;
  const isDisabled = loading || !isValid || isUnchanged;

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
      toast.error("Email cannot be empty");
      return;
    }

    if (!isValid) {
      toast.error(validationError || "Invalid email format");
      return;
    }

    try {
      setLoading(true);

      if (email === currentUser?.email) {
        toast.info("This is already your current email");
        return;
      }

      await userService.sendEmailVerificationCode(email);
      setShowCodeInput(true);
      setCodeCountdown(120); // 2 minutes countdown
      toast.info(`Verification code sent to your email: ${email}`);
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send verification code";
      toast.error(errorMessage);
      handleError(error, "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    try {
      setLoading(true);

      const updatedUser = await userService.updateEmailWithCode(
        email,
        verificationCode
      );
      setCurrentUser(updatedUser);
      toast.success("Email verified and updated successfully");
      setShowCodeInput(false);
      setVerificationCode("");
      setSidebar(SidebarMode.PROFILE);
    } catch (error) {
      handleError(error, "Email verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (codeCountdown > 0) return;

    try {
      setLoading(true);

      await userService.sendEmailVerificationCode(email);
      setCodeCountdown(120); // Reset to 2 minutes
      toast.info("Verification code resent to your email");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to resend code";
      toast.error(errorMessage);
      handleError(error, "Failed to resend code");
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
            className={`${
              isDisabled ? "" : "primary bg-[var(--border-color)]"
            } p-1 w-full`}
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
                className="primary p-1 flex-1 bg-[var(--border-color)]"
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
                  className="secondary p-1 flex-1 bg-[var(--border-color)]"
                  onClick={handleResendCode}
                  disabled={loading}
                >
                  Resend Code
                </button>
              )}
            </div>
          </div>
        )}
      </form>
    </SidebarLayout>
  );
};

export default SidebarSettingsEmail;
