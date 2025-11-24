import { useState, useMemo, useEffect } from "react";
import { useActiveChat, useChatStore } from "@/stores/chatStore";
import { getSetSidebarInfo } from "@/stores/sidebarInfoStore";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import { AvatarEdit } from "@/components/ui/avatar/AvatarEdit";
import { handleError } from "@/common/utils/error/handleError";
import { toast } from "react-toastify";
import { useActiveMembers } from "@/stores/chatMemberStore";
import { ModalType, getOpenModal } from "@/stores/modalStore";
import { SidebarInfoMode } from "@/common/enums/sidebarInfoMode";
import { ChatMemberResponse } from "@/shared/types/responses/chat-member.response";
import { getCurrentUserId } from "@/stores/authStore";
import { ChatMemberRole } from "@/shared/types/enums/chat-member-role.enum";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { useTranslation } from "react-i18next";
import { uploadAvatarToSupabase } from "@/services/supabase/uploadAvatarToSupabase";

const GroupChatEdit = () => {
  const { t } = useTranslation();
  const currentUserId = getCurrentUserId();
  const activeChat = useActiveChat() as ChatResponse;
  const activeMembers = useActiveMembers();
  const updateChat = useChatStore.getState().updateChat;

  const setSidebarInfo = getSetSidebarInfo();
  const openModal = getOpenModal();

  const myMember = activeMembers?.find(
    (member) => member.userId === currentUserId
  ) as ChatMemberResponse;

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
        newAvatarUrl = await uploadAvatarToSupabase(
          avatarFile,
          oldAvatarUrl,
          ChatType.GROUP
        );

        if (!newAvatarUrl) {
          toast.error(t("sidebar_profile.edit.avatar_upload_failed"));
          return;
        }

        console.log("Uploaded newAvatarUrl", newAvatarUrl);

        // Update form data with new avatar URL
        setFormData((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));
      }

      // Call your update action
      await updateChat({
        chatId: activeChat.id,
        name: formData.name,
        avatarUrl: newAvatarUrl,
        description: formData.description,
      });

      setSidebarInfo(SidebarInfoMode.DEFAULT);
      toast.success(t("common.messages.update_success"));
    } catch (error) {
      handleError(error, t("sidebar_profile.edit.avatar_upload_failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenLeaveChatModal = () => {
    openModal(ModalType.LEAVE_CHAT, {
      chat: activeChat,
    });
  };

  const handleOpenDeleteChatModal = () => {
    openModal(ModalType.DELETE_CHAT, { chat: activeChat });
  };

  const chatTypeDisplay =
    activeChat.type.charAt(0).toUpperCase() + activeChat.type.slice(1);

  const canLeaveChat =
    activeMembers &&
    activeMembers.length > 1 &&
    !(
      activeChat.type === ChatType.CHANNEL &&
      myMember.role === ChatMemberRole.OWNER
    );

  return (
    <aside className="relative w-full h-full overflow-hidden flex flex-col">
      <header className="flex w-full justify-between px-2 items-center min-h-[var(--header-height)] custom-border-b">
        <h1 className="text-xl font-semibold ml-2">
          {t("sidebar_info.group_edit.title", { type: chatTypeDisplay })}
        </h1>
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

      <div className="overflow-y-auto h-screen p-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-4 w-full"
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
              <label className="text-sm opacity-70">
                {" "}
                {t("sidebar_info.group_edit.group_name")}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm opacity-70">
                {t("sidebar_info.group_edit.description")}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input min-h-[120px]"
              />
            </div>
          </div>
        </form>

        <button
          onClick={() => {
            setSidebarInfo(SidebarInfoMode.MEMBERS_EDIT);
          }}
          className="mt-4 bg-[--border-color] text-lg px-3 py-1 rounded flex justify-start items-center gap-2 w-full hover:bg-[--hover-color]"
        >
          <span className="material-symbols-outlined text-3xl">
            group_search
          </span>
          <h1>{t("sidebar_info.group_edit.members")}</h1>
          <h1 className="ml-auto">{activeMembers.length}</h1>
        </button>

        <div className="custom-border absolute left-0 bottom-0 w-full overflow-hidden shadow-xl rounded-t-xl">
          {canLeaveChat && (
            <button
              className="flex gap-2 justify-center items-center p-2 text-yellow-500 w-full font-medium custom-border-t"
              onClick={handleOpenLeaveChatModal}
            >
              <span className="material-symbols-outlined">logout</span>
              {t("sidebar_info.group_edit.leave_chat", {
                type: chatTypeDisplay,
              })}
            </button>
          )}
          {myMember.role === ChatMemberRole.OWNER && (
            <button
              className="flex justify-center items-center p-2 text-red-500 w-full font-medium custom-border-t"
              onClick={handleOpenDeleteChatModal}
            >
              <i className="material-symbols-outlined">delete</i>
              {t("sidebar_info.group_edit.delete_chat", {
                type: chatTypeDisplay,
              })}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default GroupChatEdit;
