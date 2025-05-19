import { useState, useMemo } from "react";
import { useChatStore } from "@/stores/chatStore";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { privateChatService } from "@/services/chat/privateChatService";

const PrivateChatEdit = () => {
  const activeChat = useChatStore((state) => state.activeChat);
  const deleteChat = useChatStore((state) => state.deleteChat);
  const setSidebarInfo = useSidebarInfoStore((state) => state.setSidebarInfo);

  const initialFormData = useMemo(
    () => ({
      nickname: activeChat?.name || "",
    }),
    [activeChat]
  );

  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChat?.id) {
      console.error("No active chat ID found");
      return;
    }
    const updatedChat = privateChatService.updatePrivateChat(activeChat.id, {
      ...formData,
    });
    // Handle private chat update logic here
  };

  if (!activeChat || activeChat.type !== "private") return null;

  return (
    <aside className="relative w-full h-full overflow-hidden flex flex-col">
      <header className="flex w-full justify-between px-2 items-center min-h-[var(--header-height)] custom-border-b">
        <h1 className="text-xl font-semibold ml-2">Edit Private Chat</h1>
        <button
          className="flex items-center rounded-full p-2 cursor-pointer opacity-70 hover:opacity-80 h-10 w-10 hover:bg-[var(--hover-color)]"
          onClick={() => setSidebarInfo("default")}
        >
          <i className="material-symbols-outlined">close</i>
        </button>
      </header>

      <div className="overflow-y-auto h-screen">
        <div className="flex gap-4 p-4 items-center">
          <Avatar user={activeChat.chatPartner} size="12" />
          <div>
            <h1 className="text-xl font-semibold">
              {activeChat.chatPartner.first_name}{" "}
              {activeChat.chatPartner.last_name}
            </h1>
            {activeChat.chatPartner.nickname && (
              <p className="text-sm opacity-70">${activeChat.chatPartner.nickname}</p>
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center p-4 gap-4 w-full"
        >
          <div className="w-full space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm opacity-70">Set Nickname</label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
        </form>

        <div className="custom-border-t absolute bottom-0 w-full">
          <button className="flex gap-2 justify-center items-center p-2 text-yellow-500 w-full font-medium">
            <span className="material-symbols-outlined">person_cancel</span>
            Unfriend
          </button>

          <button
            className="flex justify-center items-center p-2 text-red-500 w-full font-medium custom-border-t"
            onClick={() => deleteChat(activeChat.id, activeChat.type)}
          >
            <i className="material-symbols-outlined">delete</i>
            Delete Chat
          </button>
        </div>
      </div>
    </aside>
  );
};

export default PrivateChatEdit;
