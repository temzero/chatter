import { useState, useMemo } from "react";
import { useChatStore } from "@/stores/chatStore";
import AvatarEdit from "@/components/ui/avatar/AvatarEdit";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";

const GroupChatEdit = () => {
  const activeChat = useChatStore((state) => state.activeChat);
  const deleteChat = useChatStore((state) => state.deleteChat);
  const setSidebarInfo = useSidebarInfoStore((state) => state.setSidebarInfo);

  const initialFormData = useMemo(
    () => ({
      name: activeChat?.name || "",
      avatarUrl: activeChat?.avatarUrl || "",
      description: activeChat?.description || "",
    }),
    [activeChat]
  );

  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle group chat update logic here
  };

  if (!activeChat || activeChat.type === "direct") return null;

  return (
    <aside className="relative w-full h-full overflow-hidden flex flex-col">
      <header className="flex w-full justify-between px-2 items-center min-h-[var(--header-height)] custom-border-b">
        <h1 className="text-xl font-semibold ml-2">Edit {activeChat.type}</h1>
        <button
          className="flex items-center rounded-full p-2 cursor-pointer opacity-70 hover:opacity-80 h-10 w-10 hover:bg-[var(--hover-color)]"
          onClick={() => setSidebarInfo("default")}
        >
          <i className="material-symbols-outlined">close</i>
        </button>
      </header>

      <div className="overflow-y-auto h-screen">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center p-4 gap-4 w-full"
        >
          <AvatarEdit
            avatarUrl={formData.avatarUrl}
            type={activeChat.type}
            onAvatarChange={(newAvatar) =>
              setFormData((prev) => ({ ...prev, avatarUrl: newAvatar }))
            }
          />

          <div className="w-full space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm opacity-70">Group Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm opacity-70">Description</label>
              <textarea
                name="email"
                value={formData.description}
                onChange={handleChange}
                className="input min-h-[120px]"
              />
            </div>
          </div>
        </form>

        <div className="custom-border-t absolute bottom-0 w-full">
          <button className="flex gap-2 justify-center items-center p-2 text-yellow-500 w-full font-medium">
            <span className="material-symbols-outlined">logout</span>
            Leave Group
          </button>

          <button
            className="flex justify-center items-center p-2 text-red-500 w-full font-medium custom-border-t"
            onClick={() => deleteChat(activeChat.id, activeChat.type)}
          >
            <i className="material-symbols-outlined">delete</i>
            Delete Group
          </button>
        </div>
      </div>
    </aside>
  );
};

export default GroupChatEdit;
