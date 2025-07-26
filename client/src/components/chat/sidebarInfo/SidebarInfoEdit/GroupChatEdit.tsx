import { useState, useMemo, useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { ChatResponse } from "@/types/responses/chat.response";
import AvatarEdit from "@/components/ui/avatar/AvatarEdit";
import { fileStorageService } from "@/services/storage/fileStorageService";
import { handleError } from "@/utils/handleError";
import { toast } from "react-toastify";
import { useActiveMembers } from "@/stores/chatMemberStore";
import { ModalType, useModalStore } from "@/stores/modalStore";
import { SidebarInfoMode } from "@/types/enums/sidebarInfoMode";
import { GroupChatMember } from "@/types/responses/chatMember.response";
import { useCurrentUserId } from "@/stores/authStore";
import { ChatMemberRole } from "@/types/enums/ChatMemberRole";
import { ChatType } from "@/types/enums/ChatType";

const GroupChatEdit = () => {
  const currentUserId = useCurrentUserId();
  const activeChat = useChatStore((state) => state.activeChat) as ChatResponse;
  const activeMembers = useActiveMembers();
  const updateGroupChat = useChatStore((state) => state.updateGroupChat);

  const setSidebarInfo = useSidebarInfoStore((state) => state.setSidebarInfo);
  const openModal = useModalStore((state) => state.openModal);

  const myMember = activeMembers?.find(
    (member) => member.userId === currentUserId
  ) as GroupChatMember;

  const initialFormData = useMemo(
    () => ({
      name: activeChat?.name || "",
      avatarUrl: activeChat?.avatarUrl || "",
      description: activeChat?.description || "",
    }),
    [activeChat]
  );

  const [formData, setFormData] = useState(initialFormData);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track changes between current formData and initialFormData
  useEffect(() => {
    const changed =
      formData.name !== initialFormData.name ||
      formData.avatarUrl !== initialFormData.avatarUrl ||
      formData.description !== initialFormData.description ||
      avatarFile !== null;
    setHasChanges(changed);
  }, [formData, initialFormData, avatarFile]);

  if (!activeChat || !activeMembers || !myMember) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges || !activeChat?.id) return;

    setIsSubmitting(true);

    try {
      let newAvatarUrl = formData.avatarUrl;

      // If avatar file changed, upload it first
      if (avatarFile) {
        const oldAvatarUrl = activeChat?.avatarUrl || "";

        // Upload new avatar
        newAvatarUrl = await fileStorageService.uploadAvatar(
          avatarFile,
          oldAvatarUrl,
          ChatType.GROUP
        );

        // Update form data with new avatar URL
        setFormData((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));
      }

      // Call your update action
      await updateGroupChat(activeChat.id, {
        name: formData.name,
        avatarUrl: newAvatarUrl,
        description: formData.description,
      });

      setSidebarInfo(SidebarInfoMode.DEFAULT); // Close sidebar on success
      toast.success("Update successfully");
    } catch (error) {
      handleError(error, "Update failed!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAddMemberModal = () => {
    openModal(ModalType.ADD_MEMBER, {
      chat: activeChat,
    });
  };

  const handleOpenLeaveChatModal = () => {
    openModal(ModalType.LEAVE_CHAT, {
      chat: activeChat,
    });
  };

  const handleOpenDeleteChatModal = () => {
    openModal(ModalType.DELETE_CHAT, {
      chat: activeChat,
    });
  };

  const chatTypeDisplay =
    activeChat.type.charAt(0).toUpperCase() + activeChat.type.slice(1);

  return (
    <aside className="relative w-full h-full overflow-hidden flex flex-col">
      <header className="flex w-full justify-between px-2 items-center min-h-[var(--header-height)] custom-border-b">
        <h1 className="text-xl font-semibold ml-2">Edit {activeChat.type}</h1>
        <div className="flex gap-1">
          {hasChanges && (
            <button
              className={`flex items-center justify-center rounded-full cursor-pointer hover:opacity-100 text-green-400 h-10 w-10 hover:bg-green-500 hover:text-white ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleSubmit}
              disabled={isSubmitting}
              aria-label="Save changes"
            >
              {isSubmitting ? (
                <i className="material-symbols-outlined text-3xl animate-spin">
                  progress_activity
                </i>
              ) : (
                <i className="material-symbols-outlined text-3xl">check</i>
              )}
            </button>
          )}
          <button
            className="flex items-center rounded-full p-2 cursor-pointer opacity-70 hover:opacity-80 h-10 w-10 hover:bg-[var(--hover-color)]"
            onClick={() => setSidebarInfo(SidebarInfoMode.DEFAULT)}
            aria-label="Close editor"
          >
            <i className="material-symbols-outlined">close</i>
          </button>
        </div>
      </header>

      <div className="overflow-y-auto h-screen">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center p-4 gap-4 w-full"
          encType="multipart/form-data"
        >
          <AvatarEdit
            avatarUrl={formData.avatarUrl}
            type={activeChat.type}
            onAvatarChange={(newAvatar, file) => {
              setFormData((prev) => ({ ...prev, avatarUrl: newAvatar }));
              setAvatarFile(file || null);
            }}
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
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input min-h-[120px]"
              />
            </div>
          </div>
        </form>

        <div className="custom-border absolute bottom-0 w-full overflow-hidden shadow-xl rounded-t-xl">
          {(myMember.role === ChatMemberRole.ADMIN ||
            myMember.role === ChatMemberRole.OWNER) && (
            <button
              className="flex gap-2 justify-center items-center p-2 text-[--primary-green] w-full font-medium custom-border-t"
              onClick={handleOpenAddMemberModal}
            >
              <span className="material-symbols-outlined">person_add</span>
              Add Member
            </button>
          )}

          {activeMembers && activeMembers.length > 1 && (
            <button
              className="flex gap-2 justify-center items-center p-2 text-yellow-500 w-full font-medium custom-border-t"
              onClick={handleOpenLeaveChatModal}
            >
              <span className="material-symbols-outlined">logout</span>
              Leave {chatTypeDisplay}
            </button>
          )}
          {myMember.role === ChatMemberRole.OWNER && (
            <button
              className="flex justify-center items-center p-2 text-red-500 w-full font-medium custom-border-t"
              onClick={handleOpenDeleteChatModal}
            >
              <i className="material-symbols-outlined">delete</i>
              Delete {chatTypeDisplay}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default GroupChatEdit;
