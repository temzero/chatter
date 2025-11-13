import React from "react";
import ContactInfoItem from "@/components/ui/contact/contactInfoItem";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import {
  getSetSidebarInfo,
  useSidebarInfoStore,
} from "@/stores/sidebarInfoStore";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { FriendshipStatus } from "@/shared/types/enums/friendship-type.enum";
import { ModalType, getOpenModal } from "@/stores/modalStore";
import { useMessageStore } from "@/stores/messageStore";
import { useMuteControl } from "@/common/hooks/useMuteControl";
import { SidebarInfoHeaderIcons } from "@/components/ui/icons/SidebarInfoHeaderIcons";
import { SidebarInfoMode } from "@/common/enums/sidebarInfoMode";
import { useIsMobile } from "@/stores/deviceStore";
import { useTranslation } from "react-i18next";
import FriendshipBtn from "@/components/ui/buttons/FriendshipBtn";
import { ChatMemberResponse } from "@/shared/types/responses/chat-member.response";

interface DirectChatProps {
  activeChat: ChatResponse;
  activeMembers: ChatMemberResponse[] | undefined;
}

const DirectChat: React.FC<DirectChatProps> = ({
  activeChat,
  activeMembers,
}) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const chatPartner = activeMembers?.filter(
    (member) => member.id !== activeChat.myMemberId
  )[0];

  const setSidebarInfo = getSetSidebarInfo();
  const setSidebarInfoVisible =
    useSidebarInfoStore.getState().setSidebarInfoVisible;
  const openModal = getOpenModal();
  const setDisplaySearchMessage =
    useMessageStore.getState().setDisplaySearchMessage;
  const { mute, unmute } = useMuteControl(
    activeChat?.id,
    activeChat?.myMemberId
  );

  if (!chatPartner) return null;

  const isFriend = chatPartner?.friendshipStatus === FriendshipStatus.ACCEPTED;

  console.log('isBlockedByMe', chatPartner.isBlockedByMe);
  console.log('isBlockedMe', chatPartner.isBlockedMe);

  // Header buttons with title
  const headerIcons: {
    icon: string;
    title: string;
    action: () => void;
    className?: string;
  }[] = [];

  if (chatPartner.isBlockedByMe) {
    headerIcons.push({
      icon: "lock_open_right",
      title: t("common.actions.unblock"),
      className: "text-[--primary-green]",
      action: () =>
        openModal(ModalType.UNBLOCK_USER, {
          blockedUser: {
            id: chatPartner.userId,
            username: chatPartner.username,
            firstName: chatPartner.nickname ?? chatPartner.firstName,
            avatarUrl: chatPartner.avatarUrl,
          },
        }),
    });
  } else if (chatPartner.isBlockedMe) {
    headerIcons.push({
      icon: "block",
      title: t("common.messages.blocked_me"),
      action: () =>
        openModal(ModalType.BLOCK_USER, { userToBlock: chatPartner }),
    });
  } else {
    if (activeChat.mutedUntil) {
      headerIcons.push({
        icon: "notifications_off",
        title: t("common.actions.unmute"),
        action: unmute,
      });
    } else {
      headerIcons.push({
        icon: "notifications",
        title: t("common.actions.mute"),
        action: mute,
      });
    }

    headerIcons.push(
      {
        icon: "search",
        title: t("common.actions.search"),
        action: () => setDisplaySearchMessage(true),
      },
      {
        icon: "block",
        title: t("common.actions.block"),
        action: () =>
          openModal(ModalType.BLOCK_USER, { userToBlock: chatPartner }),
      },
      {
        icon: "edit",
        title: t("common.actions.edit"),
        action: () => setSidebarInfo(SidebarInfoMode.DIRECT_EDIT),
      }
    );
  }

  if (isMobile) {
    headerIcons.unshift({
      icon: "arrow_back_ios",
      title: t("common.actions.back"),
      action: () => setSidebarInfoVisible(false),
    });
  }

  return (
    <div className="flex flex-col w-full h-full">
      <SidebarInfoHeaderIcons icons={headerIcons} />

      <div className="flex flex-col items-center gap-4 p-4 w-full h-full overflow-y-auto">
        {chatPartner.isBlockedMe ? (
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "200px" }}
          >
            sentiment_dissatisfied
          </span>
        ) : (
          <Avatar
            size={36}
            textSize="text-6xl"
            avatarUrl={chatPartner.avatarUrl}
            name={chatPartner.nickname || chatPartner.firstName}
            isBlocked={chatPartner.isBlockedByMe}
          />
        )}
        <h1 className="text-xl font-semibold">{activeChat.name}</h1>
        {chatPartner.nickname && (
          <h2 className="text-sm opacity-80 -mt-1">
            {chatPartner.firstName} {chatPartner.lastName}
          </h2>
        )}
        {chatPartner.bio && (
          <p className="text-center opacity-80">{chatPartner.bio}</p>
        )}

        {chatPartner.isBlockedMe && chatPartner.isBlockedByMe ? (
          <h1 className="text-red-500">
            {t("common.messages.blocked_each_other")}
          </h1>
        ) : chatPartner.isBlockedMe ? (
          <h1 className="text-red-500">{t("common.messages.blocked_me")}</h1>
        ) : chatPartner.isBlockedByMe ? (
          <h1 className="text-red-500">
            {t("common.messages.blocked", {
              type:
                chatPartner.friendshipStatus === FriendshipStatus.ACCEPTED
                  ? t("sidebar_new_chat.direct.friend")
                  : t("common.actions.user"),
            })}
          </h1>
        ) : null}

        {!chatPartner.isBlockedMe && !chatPartner.isBlockedByMe && (
          <FriendshipBtn
            userId={chatPartner.userId}
            username={chatPartner.username ?? "No name"}
            firstName={chatPartner.firstName}
            lastName={chatPartner.lastName}
            avatarUrl={chatPartner.avatarUrl ?? undefined}
            friendshipStatus={chatPartner.friendshipStatus}
            className="bg-[var(--primary-green)]"
          />
        )}

        {isFriend && (
          <div className="w-full flex flex-col items-center rounded font-light custom-border overflow-hidden">
            <ContactInfoItem
              icon="alternate_email"
              value={chatPartner.username}
              copyType="username"
              defaultText={t("sidebar_profile.no_username")}
            />
            <ContactInfoItem
              icon="call"
              value={chatPartner.phoneNumber || null}
              copyType="phoneNumber"
            />
            <ContactInfoItem
              icon="mail"
              value={chatPartner.email}
              copyType="email"
            />
            <ContactInfoItem
              icon="cake"
              value={chatPartner.birthday}
              copyType="birthday"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectChat;
