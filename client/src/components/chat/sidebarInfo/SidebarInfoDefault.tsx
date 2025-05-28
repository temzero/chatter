import React from "react";
import { useChatStore } from "@/stores/chatStore";
import { useMessageStore } from "@/stores/messageStore";
import {
  SidebarInfoModes,
  useSidebarInfoStore,
} from "@/stores/sidebarInfoStore";
import { AnimatePresence, motion } from "framer-motion";
import { formatTime } from "@/utils/formatTime";
import ContactInfoItem from "@/components/ui/contactInfoItem";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import RenderMedia from "@/components/ui/RenderMedia";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { ChatMemberRole } from "@/types/ChatMemberRole";
import getChatName from "@/utils/getChatName";
import type {
  ChatResponse,
  DirectChatResponse,
  GroupChatResponse,
} from "@/types/chat";
import { ChatType } from "@/types/enums/ChatType";

const SidebarInfoDefault: React.FC = () => {
  const { activeChat, activeMembers } = useChatStore();
  const { activeMedia } = useMessageStore();
  const { setSidebarInfo, isSidebarInfoVisible } = useSidebarInfoStore();

  const isDirect = activeChat?.type === ChatType.DIRECT;

  const openEditSidebar = () => {
    setSidebarInfo(isDirect ? "directEdit" : "groupEdit");
  };

  // Base header icons that are always visible
  const baseHeaderIcons = [
    { icon: "notifications", action: () => {} },
    { icon: "search", action: () => {} },
    { icon: "block", action: () => {}, className: "rotate-90" },
  ];

  // Determine if edit button should be shown
  const showEditButton =
    isDirect ||
    (!isDirect &&
      activeChat &&
      (activeChat.myRole === ChatMemberRole.ADMIN ||
        activeChat.myRole === ChatMemberRole.OWNER));

  // Final header icons array
  const headerIcons = [
    ...baseHeaderIcons,
    ...(showEditButton ? [{ icon: "edit", action: openEditSidebar }] : []),
  ];

  if (!activeChat) return null;

  const getChatDescription = (chat: ChatResponse): string | null => {
    if (chat.type === ChatType.DIRECT) {
      const directChat = chat as DirectChatResponse;
      return directChat.chatPartner.bio;
    } else {
      const groupChat = chat as GroupChatResponse;
      return groupChat.description ?? null;
    }
  };

  return (
    <aside className="relative w-full h-full overflow-hidden flex flex-col">
      <header className="flex w-full justify-around items-center min-h-[var(--header-height)] custom-border-b">
        {headerIcons.map(({ icon, action, className = "" }) => (
          <a
            key={icon}
            className={`flex items-center rounded-full p-2 cursor-pointer opacity-50 hover:opacity-100 ${className}`}
            onClick={action}
          >
            <i className="material-symbols-outlined">{icon}</i>
          </a>
        ))}
      </header>

      <div className="overflow-x-hidden overflow-y-auto h-screen">
        <div className="flex flex-col justify-center items-center p-4 gap-2 w-full pb-[70px]">
          <ChatAvatar chat={activeChat} type="info" />

          <h1 className="text-xl font-semibold">{getChatName(activeChat)}</h1>
          {isDirect &&
            (activeChat as DirectChatResponse).chatPartner.nickname && (
              <h2 className="text-sm opacity-80 -mt-1">
                {(activeChat as DirectChatResponse).chatPartner.firstName}{" "}
                {(activeChat as DirectChatResponse).chatPartner.lastName}
              </h2>
            )}

          {getChatDescription(activeChat) && (
            <p className="text-sm text-center font-light opacity-80 w-full min-w-[240px] text-ellipsis">
              {getChatDescription(activeChat)}
            </p>
          )}

          <AnimatePresence>
            {isSidebarInfoVisible && (
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="flex flex-col gap-4 w-full mt-4 min-w-[240px]"
              >
                {isDirect && (
                  <div className="w-full flex flex-col items-center rounded font-light custom-border overflow-hidden">
                    <ContactInfoItem
                      icon="alternate_email"
                      value={
                        (activeChat as DirectChatResponse).chatPartner.username
                      }
                      copyType="username"
                      defaultText="No username"
                    />
                    <ContactInfoItem
                      icon="call"
                      value={
                        (activeChat as DirectChatResponse).chatPartner
                          .phoneNumber || null
                      }
                      copyType="phoneNumber"
                    />
                    <ContactInfoItem
                      icon="mail"
                      value={
                        (activeChat as DirectChatResponse).chatPartner.email
                      }
                      copyType="email"
                    />
                    <ContactInfoItem
                      icon="cake"
                      value={formatTime(
                        (activeChat as DirectChatResponse).chatPartner.birthday
                      )}
                      copyType="birthday"
                    />
                  </div>
                )}

                <div className="flex flex-col custom-border rounded w-full">
                  {(
                    [
                      {
                        icon: "bookmark",
                        text: "Saved Messages",
                        count: 12,
                        action: "saved" as SidebarInfoModes,
                      },
                      {
                        icon: "attach_file",
                        text: "Media & Files",
                        count: activeMedia.length,
                        action: "media" as SidebarInfoModes,
                      },
                    ] as {
                      icon: string;
                      text: string;
                      count: number;
                      action: SidebarInfoModes;
                    }[]
                  ).map(({ icon, text, count, action }) => (
                    <React.Fragment key={text}>
                      <div
                        className="flex p-2 items-center justify-between w-full cursor-pointer hover:bg-[var(--hover-color)]"
                        onClick={() => setSidebarInfo(action)}
                      >
                        <div className="flex gap-2">
                          <span className="flex flex-col justify-center items-center cursor-pointer opacity-60 hover:opacity-100">
                            <i className="material-symbols-outlined">{icon}</i>
                          </span>
                          <h1>{text}</h1>
                        </div>
                        <p className="opacity-60">{count}</p>
                      </div>
                      <div className="custom-border-b"></div>
                    </React.Fragment>
                  ))}
                </div>

                {!isDirect && activeMembers.length > 0 && (
                  <div className="flex flex-col rounded overflow-hidden custom-border">
                    {activeMembers.map((member) => (
                      <div
                        key={member.userId}
                        className="flex items-center justify-between hover:bg-[var(--hover-color)] p-2 cursor-pointer"
                      >
                        <div className="flex gap-2 items-center">
                          <Avatar
                            avatarUrl={member.avatarUrl}
                            firstName={member.firstName}
                            lastName={member.lastName}
                            size="8"
                            textSize="sm"
                          />
                          <h1 className="text-sm">
                            {member.nickname ||
                              `${member.firstName} ${member.lastName}`}
                          </h1>
                        </div>
                        {member.isBanned ? (
                          <span className="material-symbols-outlined">
                            dangerous
                          </span>
                        ) : (
                          member.isAdmin && (
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
      </div>
    </aside>
  );
};

export default SidebarInfoDefault;
