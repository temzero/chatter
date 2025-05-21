import React, { useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";
import { useMessageStore } from "@/stores/messageStore";
import { AnimatePresence, motion } from "framer-motion";
import ContactInfoItem from "@/components/ui/contactInfoItem";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import RenderMedia from "@/components/ui/RenderMedia";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { formatTime } from "@/utils/formatTime";
import { Avatar } from "@/components/ui/avatar/Avatar";

const ChatInfoDefault: React.FC = () => {
  const activeChat = useChatStore((state) => state.activeChat);
  const { groupMembers, getGroupMembers } = useChatStore();
  const activeMedia = useMessageStore((state) => state.activeMedia);
  const setSidebarInfo = useSidebarInfoStore((state) => state.setSidebarInfo);
  const isSidebarInfoVisible = useSidebarInfoStore(
    (state) => state.isSidebarInfoVisible
  );

  useEffect(() => {
    // Only fetch if it's a group chat and members aren't already loaded
    if (
      activeChat?.type !== "private" &&
      activeChat?.id &&
      !groupMembers[activeChat.id]
    ) {
      getGroupMembers(activeChat.id);
    }
  }, [activeChat?.id, activeChat?.type, getGroupMembers, groupMembers]);

  const currentMembers =
    activeChat?.type !== "private" && activeChat?.id
      ? groupMembers[activeChat.id] || []
      : [];

  if (!activeChat) return null;
  const isPrivate = activeChat?.type === "private";

  const openEditSidebar = () => {
    if (isPrivate) {
      setSidebarInfo("privateEdit");
    } else {
      setSidebarInfo("groupEdit");
    }
  };

  return (
    <aside className="relative w-full h-full overflow-hidden flex flex-col">
      <header className="flex w-full justify-around items-center min-h-[var(--header-height)] custom-border-b">
        <a className="flex items-center rounded-full p-2 cursor-pointer opacity-50 hover:opacity-100">
          <i className="material-symbols-outlined">notifications</i>
        </a>
        <a className="flex items-center rounded-full p-2 cursor-pointer opacity-50 hover:opacity-100">
          <i className="material-symbols-outlined">search</i>
        </a>
        <a className="flex items-center rounded-full p-2 cursor-pointer opacity-50 hover:opacity-100">
          <i className="material-symbols-outlined rotate-90">block</i>
        </a>
        <a
          className="flex items-center rounded-full p-2 cursor-pointer opacity-50 hover:opacity-100"
          onClick={openEditSidebar}
        >
          <i className="material-symbols-outlined">edit</i>
        </a>
      </header>

      <div className="overflow-x-hidden overflow-y-auto h-screen">
        <div className="flex flex-col justify-center items-center p-4 gap-2 w-full pb-[70px]">
          <ChatAvatar chat={activeChat} type="info" />

          <h1 className="text-xl font-semibold">{activeChat.name}</h1>

          <p className="text-sm text-center font-light opacity-80 w-full min-w-[240px] text-ellipsis">
            {isPrivate ? activeChat.chatPartner.bio : activeChat.description}
          </p>

          <AnimatePresence>
            {isSidebarInfoVisible && (
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="flex flex-col gap-4 w-full mt-4 min-w-[240px]"
              >
                {isPrivate && (
                  <div className="w-full flex flex-col items-center rounded font-light custom-border overflow-hidden">
                    <ContactInfoItem
                      icon="alternate_email"
                      value={activeChat.chatPartner.username}
                      copyType="username"
                      defaultText="No username"
                    />

                    <ContactInfoItem
                      icon="call"
                      value={activeChat.chatPartner.phoneNumber || null}
                      copyType="phoneNumber"
                    />

                    <ContactInfoItem
                      icon="mail"
                      value={activeChat.chatPartner.email}
                      copyType="email"
                    />

                    <ContactInfoItem
                      icon="cake"
                      value={formatTime(
                        activeChat.chatPartner.birthday || null
                      )}
                      copyType="birthday"
                    />
                  </div>
                )}

                <div className="flex flex-col custom-border rounded w-full">
                  <div
                    className="flex p-2 items-center justify-between w-full cursor-pointer hover:bg-[var(--hover-color)]"
                    onClick={() => setSidebarInfo("saved")}
                  >
                    <div className="flex gap-2">
                      <span className="flex flex-col justify-center items-center cursor-pointer opacity-60 hover:opacity-100">
                        <i className="material-symbols-outlined">bookmark</i>
                      </span>
                      <h1>Saved Messages</h1>
                    </div>
                    <p className="opacity-60">12</p>
                  </div>

                  <div className="custom-border-b"></div>

                  <div
                    className="flex p-2 items-center justify-between w-full cursor-pointer hover:bg-[var(--hover-color)]"
                    onClick={() => setSidebarInfo("media")}
                  >
                    <div className="flex gap-2">
                      <span className="flex flex-col justify-center items-center cursor-pointer opacity-60 hover:opacity-100">
                        <i className="material-symbols-outlined">attach_file</i>
                      </span>
                      <h1>Media & Files</h1>
                    </div>
                    <p className="opacity-60">{activeMedia.length}</p>
                  </div>
                </div>

                {!isPrivate && currentMembers && (
                  <div className="flex flex-col rounded overflow-hidden custom-border">
                    {currentMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between hover:bg-[var(--hover-color)] p-2 cursor-pointer"
                      >
                        <div className="flex gap-2 items-center">
                          <Avatar user={member} size="8" textSize="sm" />
                          {member.nickname ? (
                            <h1 className="text-sm">{member.nickname}</h1>
                          ) : (
                            <h1 className="text-sm">
                              {member.firstName} {member.lastName}
                            </h1>
                          )}
                        </div>
                        {member.is_banned ? (
                          <span className="material-symbols-outlined">
                            dangerous
                          </span>
                        ) : (
                          member.is_admin && (
                            <span className="material-symbols-outlined opacity-50">
                              manage_accounts
                            </span>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div
          className="flex flex-col justify-center items-center cursor-pointer border-2 border-b-0 border-[var(--hover-color)] rounded p-1 shadow-4xl absolute -bottom-[100px] hover:-bottom-[70px] transition-all duration-300 ease-in-out backdrop-blur-[12px]"
          onClick={() => setSidebarInfo("media")}
        >
          <i className="material-symbols-outlined opacity-70">
            keyboard_control_key
          </i>
          <h1 className="-mt-1 mb-2">Media & Files</h1>
          <div className="grid grid-cols-3">
            {activeMedia.slice(0, 3).map((media, index) => (
              <div
                key={`${media.messageId}-${index}`}
                className="overflow-hidden aspect-square"
              >
                <RenderMedia
                  media={media}
                  className="hover:none custom-border"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ChatInfoDefault;
