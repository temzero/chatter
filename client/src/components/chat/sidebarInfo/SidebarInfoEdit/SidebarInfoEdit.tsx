import { useState, useEffect, useMemo } from "react";
import { useChatStore } from "@/stores/chatStore";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import PrivateChatEdit from "./DirectChatEdit";
import GroupChatEdit from "./GroupChatEdit";

const SidebarInfoEdit: React.FC = () => {
  const activeChat = useChatStore((state) => state.activeChat);
  const deleteChat = useChatStore((state) => state.deleteChat);
  const setSidebarInfo = useSidebarInfoStore((state) => state.setSidebarInfo);

  const initialFormData = useMemo(
    () => ({
      name: activeChat?.name || "",
      avatarUrl: activeChat?.avatarUrl || "",
      email: "",
    }),
    [activeChat]
  );

  const [formData, setFormData] = useState(initialFormData);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (activeChat) {
      setFormData({
        name: activeChat.name || "",
        avatarUrl: activeChat.avatarUrl || "",
        email: "",
      });
      setHasChanges(false);
    }
  }, [activeChat]);

  useEffect(() => {
    const changesDetected = Object.keys(initialFormData).some(
      (key) =>
        formData[key as keyof typeof formData] !==
        initialFormData[key as keyof typeof initialFormData]
    );
    setHasChanges(changesDetected);
  }, [formData, initialFormData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSidebarInfo("default");
  };

  const isPrivate = activeChat?.type === "direct";

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
        <PrivateChatEdit
          chatPartner={activeChat?.chatPartner}
          formData={formData}
          setFormData={setFormData}
          activeChat={activeChat}
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          deleteChat={deleteChat}
        />
      ) : (
        <GroupChatEdit
          formData={formData}
          setFormData={setFormData}
          activeChat={activeChat}
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          deleteChat={deleteChat}
        />
      )}
    </aside>
  );
};

export default SidebarInfoEdit;
