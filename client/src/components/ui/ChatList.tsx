import React from "react";
import ChatListItem from "./ChatListItem";
import type { ChatResponse } from "@/types/chat";
import { useAuthStore } from "@/stores/authStore";
import { useTypingStore } from "@/stores/typingStore";
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
  const activeTyping = useTypingStore((state) => state.activeTyping);
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
      {chats.map((chat) => {
        // Get typing users for this specific chat
        const typingUsers = Array.from(activeTyping[chat.id] || []);

        return (
          <ChatListItem
            key={chat.id}
            chat={chat}
            isCompact={isCompact}
            isOnline={false}
            currentUserId={useAuthStore.getState().currentUser?.id || ""}
            typingUsers={typingUsers}
          />
        );
      })}
    </div>
  );
};

export default React.memo(ChatList);

