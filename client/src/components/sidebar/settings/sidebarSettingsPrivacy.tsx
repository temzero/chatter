import React, { useState, useEffect } from "react";
import SidebarLayout from "@/pages/SidebarLayout";
import { SidebarMode } from "@/types/enums/sidebarMode";
import { useAuthStore } from "@/stores/authStore";
import { useCurrentUser } from "@/stores/authStore";
import { userService } from "@/services/userService";
import Toggle from "@/components/ui/Toggle";

const SidebarSettingsPrivacy: React.FC = () => {
  const currentUser = useCurrentUser();
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const setMessage = useAuthStore((state) => state.setMessage);
  const setLoading = useAuthStore((state) => state.setLoading);
  const clearMessage = useAuthStore((state) => state.clearMessage);
  const loading = useAuthStore((state) => state.loading);
  const message = useAuthStore((state) => state.message);

  const [privacySettings, setPrivacySettings] = useState({
    isPrivateAccount: currentUser?.isPrivateAccount || false,
    readReceipts: currentUser?.readReceipts || true,
    showOnlineStatus: currentUser?.showOnlineStatus || true,
    allowMessagesFrom: currentUser?.allowMessagesFrom || "everyone", // 'everyone', 'friends', 'none'
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
    value: any
  ) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isChanged) {
      setMessage("info", "No changes detected");
      return;
    }

    try {
      setLoading(true);
      clearMessage();

      const updatedUser = await userService.updatePrivacySettings(
        privacySettings
      );
      setCurrentUser(updatedUser);
      setMessage("success", "Privacy settings updated successfully");
    } catch (error) {
      console.error(error);
      setMessage(
        "error",
        error instanceof Error
          ? error.message
          : "Failed to update privacy settings"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout
      title="Privacy & Security"
      backLocation={SidebarMode.SETTINGS}
    >
      <form onSubmit={handleSubmit} className="p-2 flex flex-col gap-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--hover-color)]">
            <div>
              <h3 className="font-medium">Private Account</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {privacySettings.isPrivateAccount
                  ? "Only approved followers can see your content"
                  : "Anyone can see your content"}
              </p>
            </div>
            <Toggle
              enabled={privacySettings.isPrivateAccount}
              setEnabled={(val) => handleSettingChange("isPrivateAccount", val)}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--hover-color)]">
            <div>
              <h3 className="font-medium">Read Receipts</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {privacySettings.readReceipts
                  ? "People will see when you've read their messages"
                  : "People won't see when you've read their messages"}
              </p>
            </div>
            <Toggle
              enabled={privacySettings.readReceipts}
              setEnabled={(val) => handleSettingChange("readReceipts", val)}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--hover-color)]">
            <div>
              <h3 className="font-medium">Online Status</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {privacySettings.showOnlineStatus
                  ? "People will see when you're online"
                  : "People won't see when you're online"}
              </p>
            </div>
            <Toggle
              enabled={privacySettings.showOnlineStatus}
              setEnabled={(val) => handleSettingChange("showOnlineStatus", val)}
            />
          </div>

          <div className="p-3 rounded-lg bg-[var(--hover-color)]">
            <h3 className="font-medium mb-2">Who Can Message You</h3>
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
                    {option === "everyone" && "Everyone"}
                    {option === "friends" && "Friends Only"}
                    {option === "none" && "No One"}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className={`${!isChanged ? "" : "primary"} p-1 w-full`}
          disabled={!isChanged || loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

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

export default SidebarSettingsPrivacy;
