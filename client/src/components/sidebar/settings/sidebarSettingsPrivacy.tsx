import React, { useState, useEffect } from "react";
import SidebarLayout from "@/layouts/SidebarLayout";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { getCurrentUser, useAuthStore } from "@/stores/authStore";
import { userService } from "@/services/http/userService";
import { useTranslation } from "react-i18next";
import SwitchBtn from "@/components/ui/buttons/SwitchBtn";

const SidebarSettingsPrivacy: React.FC = () => {
  const { t } = useTranslation();
  const currentUser = getCurrentUser();
  const message = useAuthStore((state) => state.message);
  const setCurrentUser = useAuthStore.getState().setCurrentUser;
  const setMessage = useAuthStore.getState().setMessage;
  const setLoading = useAuthStore.getState().setLoading;

  const [privacySettings, setPrivacySettings] = useState({
    isPrivateAccount: currentUser?.isPrivateAccount || false,
    readReceipts: currentUser?.readReceipts || true,
    showOnlineStatus: currentUser?.showOnlineStatus || true,
    allowMessagesFrom: currentUser?.allowMessagesFrom || "everyone",
  });

  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const hasChanged =
        privacySettings.isPrivateAccount !== currentUser.isPrivateAccount ||
        privacySettings.readReceipts !== currentUser.readReceipts ||
        privacySettings.showOnlineStatus !== currentUser.showOnlineStatus ||
        privacySettings.allowMessagesFrom !== currentUser.allowMessagesFrom;
      setIsChanged(hasChanged);
    }
  }, [privacySettings, currentUser]);

  const handleSettingChange = (
    setting: keyof typeof privacySettings,
    value: unknown
  ) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isChanged) {
      setMessage({ type: "info", content: "No changes detected" });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const updatedUser = await userService.updatePrivacySettings(
        privacySettings
      );
      setCurrentUser(updatedUser);
      setMessage({
        type: "success",
        content: "Privacy settings updated successfully",
      });
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        content:
          error instanceof Error
            ? error.message
            : "Failed to update privacy settings",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout
      title={t("privacy_settings.title")}
      backLocation={SidebarMode.SETTINGS}
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="flex items-center justify-between p-4 custom-border-b">
          <div>
            <h3 className="font-medium">
              {t("privacy_settings.private_account.label")}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {privacySettings.isPrivateAccount
                ? t("privacy_settings.private_account.desc_private")
                : t("privacy_settings.private_account.desc_public")}
            </p>
          </div>
          <SwitchBtn
            checked={privacySettings.isPrivateAccount}
            onCheckedChange={(val) =>
              handleSettingChange("isPrivateAccount", val)
            }
          />
        </div>

        <div className="flex items-center justify-between p-4 custom-border-b">
          <div>
            <h3 className="font-medium">
              {t("privacy_settings.read_receipts.label")}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {privacySettings.readReceipts
                ? t("privacy_settings.read_receipts.desc_on")
                : t("privacy_settings.read_receipts.desc_off")}
            </p>
          </div>
          <SwitchBtn
            checked={privacySettings.readReceipts}
            onCheckedChange={(val) => handleSettingChange("readReceipts", val)}
          />
        </div>

        <div className="flex items-center justify-between p-4 custom-border-b">
          <div>
            <h3 className="font-medium">
              {t("privacy_settings.online_status.label")}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {privacySettings.showOnlineStatus
                ? t("privacy_settings.online_status.desc_on")
                : t("privacy_settings.online_status.desc_off")}
            </p>
          </div>
          <SwitchBtn
            checked={privacySettings.showOnlineStatus}
            onCheckedChange={(val) =>
              handleSettingChange("showOnlineStatus", val)
            }
          />
        </div>

        <div className="p-3 custom-border-b">
          <h3 className="font-medium mb-2">
            {t("privacy_settings.allow_messages_from.label")}
          </h3>
          <div className="space-y-2">
            {["everyone", "friends", "none"].map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="radio"
                  id={`message-${option}`}
                  name="allowMessagesFrom"
                  checked={privacySettings.allowMessagesFrom === option}
                  onChange={() =>
                    handleSettingChange("allowMessagesFrom", option)
                  }
                  className="mr-2"
                />
                <label htmlFor={`message-${option}`} className="capitalize">
                  {t(`privacy_settings.allow_messages_from.options.${option}`)}
                </label>
              </div>
            ))}
          </div>
        </div>

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
            {message.type === "error" && t("privacy_settings.messages.error")}
            {message.type === "success" &&
              t("privacy_settings.messages.success")}
            {message.type === "info" &&
              t("privacy_settings.messages.no_changes")}
          </div>
        )}
      </form>
    </SidebarLayout>
  );
};

export default SidebarSettingsPrivacy;
