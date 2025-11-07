import React, { useState, useEffect } from "react";
import SidebarLayout from "@/layouts/SidebarLayout";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { useAuthStore, getCurrentUser } from "@/stores/authStore";
import { userService } from "@/services/http/userService";
import { getSetSidebar } from "@/stores/sidebarStore";
import { handleError } from "@/common/utils/handleError";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { validateEmail } from "@/common/utils/validation/emailValidation";

const SidebarSettingsEmail: React.FC = () => {
  const { t } = useTranslation();
  const currentUser = getCurrentUser();
  const setSidebar = getSetSidebar();

  const setCurrentUser = useAuthStore.getState().setCurrentUser;

  const loading = useAuthStore((state) => state.loading);
  const setLoading = useAuthStore.getState().setLoading;

  const [email, setEmail] = useState(currentUser?.email || "");
  const [verificationCode, setVerificationCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [codeCountdown, setCodeCountdown] = useState(0);
  const isUnchanged = email === currentUser?.email;
  const isEmailVerified = currentUser?.emailVerified;
  const isDisabled = loading || !isValid || (isUnchanged && isEmailVerified);

  // Validate email whenever it changes
  useEffect(() => {
    if (!email) {
      setIsValid(false);
      setValidationError("");
      return;
    }

    if (!validateEmail(email)) {
      setIsValid(false);
      setValidationError(t("account_settings.change_email.messages.invalid"));
      return;
    }

    setIsValid(true);
    setValidationError("");
  }, [email, t]);

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
      toast.error(t("common.messages.required"));
      return;
    }

    if (!isValid) {
      toast.error(
        validationError || t("account_settings.change_email.messages.invalid")
      );
      return;
    }

    try {
      setLoading(true);

      if (isUnchanged && isEmailVerified) {
        toast.info(t("account_settings.change_email.messages.already_current"));
        return;
      }

      await userService.sendEmailVerificationCode(email);
      setShowCodeInput(true);
      setCodeCountdown(120); // 2 minutes countdown
      toast.info(t("account_settings.change_email.messages.sent", { email }));
    } catch (error) {
      handleError(
        error,
        t("account_settings.change_email.messages.failed_send")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast.error(t("common.messages.invalid_code"));
      return;
    }

    try {
      setLoading(true);

      const updatedUser = await userService.updateEmailWithCode(
        email,
        verificationCode
      );
      setCurrentUser(updatedUser);
      toast.success(t("account_settings.change_email.messages.success"));
      setShowCodeInput(false);
      setVerificationCode("");
      setSidebar(SidebarMode.PROFILE);
    } catch {
      toast.error(t("common.messages.invalid_code"));
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
      toast.info(t("account_settings.change_email.messages.sent", { email }));
    } catch (error) {
      handleError(
        error,
        t("account_settings.change_email.messages.failed_resend")
      );
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
      title={t("account_settings.change_email.title")}
      backLocation={SidebarMode.SETTINGS_ACCOUNT}
    >
      <form onSubmit={handleSubmit} className="p-2 flex flex-col gap-2">
        <div className="w-full p-4 rounded-lg bg-[var(--hover-color)]">
          <ul className="space-y-1 dark:text-gray-300">
            {(
              t("account_settings.change_email.requirements", {
                returnObjects: true,
              }) as string[]
            ).map((requirement: string, index: number) => (
              <li key={index}>• {requirement}</li>
            ))}
          </ul>
        </div>

        <div className="input flex items-center justify-between">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            disabled={loading || showCodeInput}
            name="email"
            placeholder={t("account_settings.change_email.placeholder")}
            className="flex-1"
            autoComplete="email"
            autoFocus
          />
        </div>

        {isUnchanged && isEmailVerified && (
          <div className="flex items-center justify-start gap-1 px-1 py-0.5  text-green-500 rounded">
            <span className="material-symbols-outlined">check_circle</span>
            <p>{t("common.messages.verified")}</p>
          </div>
        )}

        {!showCodeInput ? (
          !isUnchanged && (
            <button
              type="submit"
              className={`${
                isDisabled ? "" : "primary bg-[var(--border-color)]"
              } p-1 w-full`}
              disabled={isDisabled}
            >
              {loading
                ? t("common.loading.sending")
                : t("common.actions.send_verification")}
            </button>
          )
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
                placeholder={t("common.actions.enter_code")}
                className="border-bottom text-3xl"
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
                {loading
                  ? t("common.loading.verifying")
                  : t("common.actions.verify_code")}
              </button>
              {codeCountdown > 0 ? (
                <button type="button" className="secondary p-1 flex-1" disabled>
                  {t("account_settings.change_email.resend_in", {
                    time: formatCountdown(codeCountdown),
                  })}
                </button>
              ) : (
                <button
                  type="button"
                  className="secondary p-1 flex-1 bg-[var(--border-color)]"
                  onClick={handleResendCode}
                  disabled={loading}
                >
                  {t("common.actions.resend_code")}
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
