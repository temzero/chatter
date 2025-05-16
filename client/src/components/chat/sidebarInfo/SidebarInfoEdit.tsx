import { useState, useEffect, useMemo } from "react";
import { useChatStore } from "@/stores/chatStore";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import AvatarEdit from "@/components/ui/avatar/AvatarEdit";

const ChatInfoEdit: React.FC = () => {
  const activeChat = useChatStore((state) => state.activeChat);
  const deleteChat = useChatStore((state) => state.deleteChat);
  const setSidebarInfo = useSidebarInfoStore((state) => state.setSidebarInfo);

  // Initialize formData with all necessary fields from activeChat
  const initialFormData = useMemo(
    () => ({
      name: activeChat?.name || "",
      avatar: activeChat?.avatar || "",
      email: "", // For nickname/description fields
    }),
    [activeChat]
  );

  const [formData, setFormData] = useState(initialFormData);
  const [hasChanges, setHasChanges] = useState(false);

  // Update formData when activeChat changes
  useEffect(() => {
    if (activeChat) {
      const newInitialData = {
        name: activeChat.name || "",
        avatar: activeChat.avatar || "",
        email: "", // Reset nickname/description fields
      };
      setFormData(newInitialData);
      setHasChanges(false); // Reset changes when activeChat changes
    }
  }, [activeChat]);

  // Check for changes whenever formData changes
  useEffect(() => {
    const changesDetected = Object.keys(initialFormData).some(
      (key) =>
        formData[key as keyof typeof formData] !==
        initialFormData[key as keyof typeof initialFormData]
    );
    setHasChanges(changesDetected);
  }, [formData, initialFormData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSidebarInfo("default");
  };

  const isPrivate = activeChat?.type === "private";

  return (
    <aside className="relative w-full h-full overflow-hidden flex flex-col">
      <header className="flex w-full justify-between px-2 items-center min-h-[var(--header-height)] custom-border-b">
        <h1 className="text-xl font-semibold ml-2">
          Edit {!isPrivate && activeChat?.type}
        </h1>
        <div className="flex gap-2">
          {hasChanges && (
            <button
              className="flex items-center justify-center rounded-full cursor-pointer hover:opacity-100 text-green-400 h-10 w-10 hover:bg-green-500 hover:text-white"
              onClick={handleSubmit}
            >
              <i className="material-symbols-outlined text-3xl">check</i>
            </button>
          )}
          <button
            className="flex items-center rounded-full p-2 cursor-pointer opacity-70 hover:opacity-80 h-10 w-10 hover:bg-[var(--hover-color)]"
            onClick={() => setSidebarInfo("default")}
          >
            <i className="material-symbols-outlined">close</i>
          </button>
        </div>
      </header>

      {isPrivate ? (
        <div className="overflow-y-auto h-screen">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center p-4 gap-4 w-full"
          >
            <AvatarEdit
              avatar={formData.avatar}
              onAvatarChange={(newAvatar) =>
                setFormData((prev) => ({ ...prev, avatar: newAvatar }))
              }
            />

            <div className="w-full space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm opacity-70">
                  Set Nickname for {activeChat.chatPartner.first_name}{" "}
                  {activeChat.chatPartner.last_name}
                </label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 rounded border border-[var(--border-color)]"
                />
                <div className="border border-[var(--border-color)]"></div>
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
              onClick={() => {
                if (activeChat) {
                  deleteChat(activeChat.id, activeChat.type);
                }
              }}
            >
              <i className="material-symbols-outlined">delete</i>
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-y-auto h-screen">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center p-4 gap-4 w-full"
          >
            <AvatarEdit
              avatar={formData.avatar}
              type={activeChat?.type}
              onAvatarChange={(newAvatar) =>
                setFormData((prev) => ({ ...prev, avatar: newAvatar }))
              }
            />

            <div className="w-full space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm opacity-70">
                  Set {activeChat?.type} name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 rounded border border-[var(--border-color)]"
                />
                <div className="border border-[var(--border-color)]"></div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm opacity-70">Description</label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 rounded border border-[var(--border-color)]"
                />
                <div className="border border-[var(--border-color)]"></div>
              </div>
            </div>
          </form>

          <div className="custom-border-t absolute bottom-0 w-full">
            <button className="flex gap-2 justify-center items-center p-2 text-yellow-500 w-full font-medium">
              <span className="material-symbols-outlined">logout</span>
              Leave
            </button>

            <button
              className="flex justify-center items-center p-2 text-red-500 w-full font-medium custom-border-t"
              onClick={() => {
                if (activeChat) {
                  deleteChat(activeChat.id, activeChat.type);
                }
              }}
            >
              <i className="material-symbols-outlined">delete</i>
              Delete {activeChat?.type}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default ChatInfoEdit;
