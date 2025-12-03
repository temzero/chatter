import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { getCurrentUser, useAuthStore } from "@/stores/authStore";
import { userService } from "@/services/http/userService";
import { getSetSidebar } from "@/stores/sidebarStore";
import { handleError } from "@/common/utils/error/handleError";
import { useTranslation } from "react-i18next";
import SidebarLayout from "@/layouts/SidebarLayout";
import { validateUsername } from "@/common/utils/validation/usernameValication";

const SidebarSettingsUsername: React.FC = () => {
  const { t } = useTranslation();
  const currentUser = getCurrentUser();

  const setCurrentUser = useAuthStore.getState().setCurrentUser;
  const setSidebar = getSetSidebar();

  const loading = useAuthStore((state) => state.loading);
  const setLoading = useAuthStore.getState().setLoading;

  const [username, setUsername] = useState(currentUser?.username || "");
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  const isUnchanged = username === currentUser?.username;
  const isDisabled = loading || !isValid || isUnchanged;

  const invalidMessage = t("account_settings.change_username.messages.invalid");
  // Validate username whenever it changes
  useEffect(() => {
    if (!username) {
      setIsValid(false);
      setErrorMessage("");
      return;
    }

    if (!validateUsername(username)) {
      setIsValid(false);
      setErrorMessage(invalidMessage);
      return;
    }

    setIsValid(true);
    setErrorMessage("");
  }, [username, invalidMessage]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error(invalidMessage);
      return;
    }

    if (!isValid) {
      toast.error(invalidMessage);
      return;
    }

    try {
      setLoading(true);
      setIsAvailable(false);

      if (username === currentUser?.username) {
        setIsVerified(false);
        toast.info(
          t("account_settings.change_username.messages.already_current")
        );
        return;
      }

      const data = await userService.verifyUsername(username);

      if (data.payload) {
        setIsAvailable(true);
        toast.success(t("account_settings.change_username.messages.available"));
      } else {
        toast.error(t("account_settings.change_username.messages.taken"));
      }
      setIsVerified(true);
    } catch (error) {
      setIsVerified(false);
      setIsAvailable(false);
      setErrorMessage(t("account_settings.change_username.messages.failed"));
      handleError(error, t("account_settings.change_username.messages.failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isVerified || !isAvailable) {
      toast.error(t("account_settings.change_username.messages.verify_first"));
      return;
    }

    try {
      setLoading(true);

      const updatedUser = await userService.updateUsername(username);
      setCurrentUser(updatedUser);
      setIsVerified(false);
      setIsAvailable(false);
      toast.success(t("account_settings.change_username.messages.available"));
      setSidebar(SidebarMode.SETTINGS_ACCOUNT);
    } catch (error) {
      setErrorMessage(t("account_settings.change_username.messages.failed"));
      handleError(error, t("account_settings.change_username.messages.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout
      title={t("account_settings.change_username.title")}
      backLocation={SidebarMode.SETTINGS_ACCOUNT}
    >
      <form onSubmit={handleVerify} className="p-2 flex flex-col gap-2">
        <div className="w-full p-4 rounded-lg bg-(--hover-color)">
          <ul className="space-y-1 dark:text-gray-300">
            {(
              t("account_settings.change_username.requirements", {
                returnObjects: true,
              }) as string[]
            ).map((requirement: string, index: number) => (
              <li key={index}>• {requirement}</li>
            ))}
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
            placeholder={t("account_settings.change_username.placeholder")}
            className="flex-1"
            autoComplete="username"
            autoFocus
          />
          {isVerified &&
            (isAvailable ? (
              <span className="material-symbols-outlined text-green-500 -mx-1">
                check_circle
              </span>
            ) : (
              <button
                onClick={() => {
                  setUsername("");
                  setErrorMessage("");
                  setIsVerified(false);
                  setIsAvailable(false);
                }}
              >
                <span className="material-symbols-outlined text-red-500 -mx-1">
                  cancel
                </span>
              </button>
            ))}
        </div>

        {errorMessage && (
          <div className="text-sm text-red-600">{errorMessage}</div>
        )}

        <button
          type="submit"
          className={`${
            isDisabled ? "" : "text-white bg-(--primary-green)"
          } p-1 w-full`}
          disabled={isDisabled}
        >
          {loading && !isVerified
            ? t("common.actions.verify")
            : t("common.actions.verify")}
        </button>

        {isVerified && isAvailable && (
          <button
            type="button"
            onClick={handleSubmitUpdate}
            className="primary p-1 w-full"
            disabled={loading}
          >
            {loading
              ? t("common.actions.update")
              : t("account_settings.change_username.button")}
          </button>
        )}
      </form>
    </SidebarLayout>
  );
};

export default SidebarSettingsUsername;
