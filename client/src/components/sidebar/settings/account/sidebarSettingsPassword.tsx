// export default SidebarSettingsPassword;
import React, { useState, useEffect } from "react";
import SidebarLayout from "@/layouts/SidebarLayout";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { useAuthStore } from "@/stores/authStore";
import { userService } from "@/services/http/userService";
import { getSetSidebar } from "@/stores/sidebarStore";
import { toast } from "react-toastify";
import { handleError } from "@/common/utils/error/handleError";
import { useTranslation } from "react-i18next";
import { validatePassword } from "@/common/utils/validation/passwordValidation";
import { PasswordField } from "@/components/ui/form/PasswordField";

const SidebarSettingsPassword: React.FC = () => {
  const { t } = useTranslation();
  const loading = useAuthStore((state) => state.loading);
  const setLoading = useAuthStore.getState().setLoading;

  const setSidebar = getSetSidebar();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isValid, setIsValid] = useState(false);

  const isDisabled =
    loading || !isValid || !currentPassword || !newPassword || !confirmPassword;

  useEffect(() => {
    const { isValid } = validatePassword(t, newPassword, confirmPassword);
    setIsValid(isValid);
  }, [newPassword, confirmPassword, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(t("account_settings.change_password.messages.all_required"));
      return;
    }

    if (!isValid) {
      toast.error(
        t("account_settings.change_password.messages.invalid_format")
      );
      return;
    }

    try {
      setLoading(true);

      const { payload, message } = await userService.changePassword(
        currentPassword,
        newPassword
      );

      if (payload) {
        toast.success(t("account_settings.change_password.messages.success"));
        // Clear form after successful change
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSidebar(SidebarMode.SETTINGS_ACCOUNT);
      } else {
        // toast.error(
        //   message ||
        //     t("account_settings.change_password.messages.failed")
        // );
        toast.error(t(`account_settings.change_password.messages.${message}`));
      }
    } catch (error) {
      handleError(error, t("account_settings.change_password.messages.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout
      title={t("account_settings.change_password.title")}
      backLocation={SidebarMode.SETTINGS_ACCOUNT}
    >
      <form onSubmit={handleSubmit} className="p-2 flex flex-col gap-2">
        <div className="w-full p-4 rounded-lg bg-(--hover-color)">
          <ul className="space-y-1 dark:text-gray-300">
            {(
              t("account_settings.change_password.requirements", {
                returnObjects: true,
              }) as string[]
            ).map((requirement: string, index: number) => (
              <li key={index}>• {requirement}</li>
            ))}
          </ul>
        </div>

        {/* <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          disabled={loading}
          name="currentPassword"
          placeholder={t(
            "account_settings.change_password.placeholder.current"
          )}
          className="input-container"
          autoComplete="current-password"
          autoFocus
        />

        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={loading}
          name="newPassword"
          placeholder={t("account_settings.change_password.placeholder.new")}
          className="input-container"
          autoComplete="new-password"
        />

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          name="confirmPassword"
          placeholder={t(
            "account_settings.change_password.placeholder.confirm"
          )}
          className="input-container"
          autoComplete="new-password"
        /> */}

        <PasswordField
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          disabled={loading}
          name="currentPassword"
          placeholder={t(
            "account_settings.change_password.placeholder.current"
          )}
          autoComplete="current-password"
          autoFocus
        />

        <PasswordField
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={loading}
          name="newPassword"
          placeholder={t("account_settings.change_password.placeholder.new")}
          autoComplete="new-password"
        />

        <PasswordField
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          name="confirmPassword"
          placeholder={t(
            "account_settings.change_password.placeholder.confirm"
          )}
          autoComplete="new-password"
        />

        <button
          type="submit"
          className={`${isDisabled ? "" : "primary"} p-1 w-full`}
          disabled={isDisabled}
        >
          {loading
            ? t("account_settings.change_password.buttons.changing")
            : t("account_settings.change_password.buttons.change")}
        </button>
      </form>
    </SidebarLayout>
  );
};

export default SidebarSettingsPassword;
