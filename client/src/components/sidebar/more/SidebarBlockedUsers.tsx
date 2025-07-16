import React, { useEffect, useState } from "react";
import SidebarLayout from "@/pages/SidebarLayout";
import { blockService } from "@/services/blockService";
import { BlockResponseDto } from "@/types/responses/block.response";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { toast } from "react-toastify";
import { FadeLoader } from "react-spinners";

const SidebarBlockedUsers: React.FC = () => {
  const [blockedUsers, setBlockedUsers] = useState<BlockResponseDto[]>([]);
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

  const handleUnblock = async (blockedId: string, name: string) => {
    try {
      await blockService.unblockUser(blockedId);
      setBlockedUsers((prev) => prev.filter((b) => b.blocked.id !== blockedId));
      toast.success(`${name} has been unblocked`);
    } catch (err) {
      console.error("Failed to unblock user", err);
      toast.error("Failed to unblock user");
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  return (
    <SidebarLayout title="Blocked Users">
      {loading ? (
        <div className="flex flex-col items-center justify-center w-full pt-6">
          <FadeLoader color="#737373" height={8} width={3} margin={2} />
        </div>
      ) : blockedUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full p-10 opacity-70 text-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-gray-400">
            folder_off
          </span>
          <p className="text-base text-gray-500">No blocked users found</p>
          <p className="text-sm text-gray-400">
            Blocked users will appear here. You can block someone from their
            profile or chat screen.
          </p>
        </div>
      ) : (
        <div className="space-y-4 overflow-x-hidden">
          {blockedUsers.map(({ id, blocked }) => (
            <div key={id} className="flex flex-col items-center group">
              <button
                key={id}
                className="w-full flex items-center justify-between p-4 rounded-none hover:bg-[var(--hover-color)]"
                onClick={() =>
                  handleUnblock(
                    blocked.id,
                    blocked.username || blocked.firstName
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <div className="relative select-none ">
                    <Avatar
                      avatarUrl={blocked.avatarUrl}
                      name={blocked.username || blocked.firstName}
                    />

                    {/* Default block icon (visible until hover) */}
                    <span className="absolute inset-0 flex items-center justify-center text-red-500 opacity-50 group-hover:opacity-0">
                      <i className="material-symbols-outlined text-6xl rotate-90">
                        block
                      </i>
                    </span>

                    {/* Replay icon (hidden until hover) */}
                    <span className="absolute inset-0 flex items-center justify-center text-green-500 opacity-0 group-hover:opacity-100">
                      <i className="material-symbols-outlined text-6xl">
                        replay
                      </i>
                    </span>
                  </div>

                  <div className="flex flex-col items-start">
                    <p className="font-medium">
                      {blocked.firstName} {blocked.lastName}
                    </p>
                    <p className="text-sm opacity-50">@{blocked.username}</p>
                  </div>
                </div>
                <h1 className="opacity-0 group-hover:opacity-100 text-green-500 font-semibold">
                  Unblock
                </h1>
              </button>
              <div className="custom-border-b w-[90%]"></div>
            </div>
          ))}
        </div>
      )}
    </SidebarLayout>
  );
};

export default SidebarBlockedUsers;
