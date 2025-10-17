import React, { useEffect, useState } from "react";
import SidebarLayout from "@/layouts/SidebarLayout";
import { blockService } from "@/services/blockService";
import { BlockResponse } from "@/shared/types/responses/block.response";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { FadeLoader } from "react-spinners";
import { ModalType, useModalStore } from "@/stores/modalStore";
import { useTranslation } from "react-i18next";

const SidebarBlockedUsers: React.FC = () => {
  const { t } = useTranslation();
  const [blockedUsers, setBlockedUsers] = useState<BlockResponse[]>([]);
  const openModal = useModalStore((state) => state.openModal);
  const [loading, setLoading] = useState(true);

  const fetchBlockedUsers = async () => {
    try {
      const users = await blockService.getAllBlockedUsers();
      setBlockedUsers(users);
    } catch (err) {
      console.error("Failed to fetch blocked users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const removeBlockedUserFromList = (id: string) => {
    setBlockedUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <SidebarLayout title={t("sidebar_blocked.title")}>
      {loading ? (
        <div className="flex flex-col items-center justify-center w-full pt-6">
          <FadeLoader color="#737373" height={8} width={3} margin={2} />
          <p className="text-sm text-gray-500 mt-4">
            {t("common.loading.loading")}
          </p>
        </div>
      ) : blockedUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full p-10 opacity-70 text-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-gray-400">
            folder_off
          </span>
          <p className="text-base text-gray-500">
            {t("sidebar_blocked.empty.title")}
          </p>
          <p className="text-sm text-gray-400">
            {t("sidebar_blocked.empty.subtitle")}
          </p>
        </div>
      ) : (
        <div className="overflow-x-hidden">
          {blockedUsers.map(({ id, blocked }) => (
            <div key={id} className="flex flex-col items-center group">
              <div
                key={id}
                className="w-full flex items-center justify-between p-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    avatarUrl={blocked.avatarUrl}
                    name={blocked.username || blocked.firstName}
                    isBlocked={true}
                  />
                  <div className="flex flex-col items-start">
                    <p className="font-medium">
                      {blocked.firstName} {blocked.lastName}
                    </p>
                    <p className="text-sm opacity-50">@{blocked.username}</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    openModal(ModalType.UNBLOCK_USER, {
                      blockedUser: blocked,
                      onUnblockSuccess: () =>
                        removeBlockedUserFromList(blocked.id),
                    })
                  }
                  className="opacity-0 custom-border p-1.5 rounded-full hover:bg-[--primary-green] hover:text-[--sidebar-color] group-hover:opacity-100 text-[--primary-green] text-sm font-semibold"
                >
                  <span className="material-symbols-outlined">
                    lock_open_right
                  </span>
                </button>
              </div>
              <div className="custom-border-b w-[90%]"></div>
            </div>
          ))}
        </div>
      )}
    </SidebarLayout>
  );
};

export default SidebarBlockedUsers;
