import React, { useMemo } from "react";
import ChatListItem from "./ChatListItem";
import type { ChatResponse } from "@/types/chat";
// import { useChatsOnlineStatus } from "@/hooks/useChatsOnlineStatus";
import { useAuthStore, useCurrentUser } from "@/stores/authStore";
import { useWhyDidYouUpdate } from "@/hooks/useWhyDidYouUpdate";
import { useTypingStore } from "@/stores/typingStore";
import { useChatStore } from "@/stores/chatStore";
interface ChatListProps {
  chats: ChatResponse[];
  isCompact?: boolean;
}

// const ChatList: React.FC<ChatListProps> = ({ chats, isCompact = false }) => {
//   const activeChatId = useChatStore((state) => state.activeChat?.id);
//   console.log("Active Chat ID:", activeChatId);
//   // const onlineChatsStatus = useChatsOnlineStatus(chats);
//   // const onlineChatsStatus = false;
//   // const currentUser = useCurrentUser();
//   const currentUserId = useAuthStore.getState().currentUser?.id || null;

//   // const currentUserId = "123";
//   console.log("Current User ID:", currentUserId);

//   console.log("ChatList Mounted");
//   useWhyDidYouUpdate("ChatList", { chats, isCompact });

//   const typingMap = useTypingStore((state) => state.typingMap);
//   const typingUsers = useMemo(() => {
//     const chatTypingMap = activeChatId ? typingMap[activeChatId] || {} : {};
//     return (
//       Object.entries(chatTypingMap)
//         // eslint-disable-next-line @typescript-eslint/no-unused-vars
//         .filter(([_, isTyping]) => isTyping)
//         .map(([userId]) => userId)
//     );
//   }, [typingMap, activeChatId]);

//   return (
//     <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
//       {chats.map((chat) => (
//         <ChatListItem
//           key={chat.id}
//           chat={chat}
//           isCompact={isCompact}
//           // isOnline={onlineChatsStatus[chat.id] || false}
//           isOnline={false}
//           // currentUserId={currentUser?.id || ""}
//           currentUserId={currentUserId || ""}
//           typingUsers={typingUsers}
//         />
//       ))}
//     </div>
//   );
// };

const ChatList: React.FC<ChatListProps> = ({ chats, isCompact = false }) => {
  const typingMap = useTypingStore((state) => state.typingMap);
  console.log('typingMap:', typingMap);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
      {chats.map((chat) => {
        // Filter typing users for THIS specific chat only
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const typingUsers = useMemo(() => {
          const chatTypingMap = typingMap[chat.id] || {}; // Use chat.id instead of activeChatId
          return Object.entries(chatTypingMap)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .filter(([_, isTyping]) => isTyping)
            .map(([userId]) => userId);
        }, [chat.id]); // Re-run when this chat's typing data changes

        return (
          <ChatListItem
            key={chat.id}
            chat={chat}
            isCompact={isCompact}
            isOnline={false}
            currentUserId={useAuthStore.getState().currentUser?.id || ""}
            typingUsers={typingUsers} // Now chat-specific
          />
        );
      })}
    </div>
  );
};

export default React.memo(ChatList);
