// import React from "react";
// import ChatListItem from "./ChatListItem";
// import type { ChatResponse } from "@/types/chat";
// import { useAuthStore } from "@/stores/authStore";
// import { useChatStore } from "@/stores/chatStore";

// interface ChatListProps {
//   chats: ChatResponse[];
//   isCompact?: boolean;
// }

// const ChatList: React.FC<ChatListProps> = React.memo(({ chats, isCompact = false }) => {
//   console.log('chatList')
//   const currentUserId = useAuthStore((state) => state.currentUser?.id || "");
//   const activeChatId = useChatStore((state) => state.activeChat?.id);
//   const setActiveChatById = useChatStore((state) => state.setActiveChatById);

//   const handleSelectChat = (chatId: string) => {
//     console.log('handleSelectChat', chatId)
//     setActiveChatById(chatId);
//   };

//   return (
//     <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
//       {chats.map((chat) => (
//         <ChatListItem
//           key={chat.id}
//           chat={chat}
//           isActive={chat.id === activeChatId}
//           isCompact={isCompact}
//           currentUserId={currentUserId}
//           onSelect={handleSelectChat}
//         />
//       ))}
//     </div>
//   );
// });

// export default ChatList;

import React from "react";
import ChatListItem from "./ChatListItem";
import type { ChatResponse } from "@/types/chat";
import { useAuthStore } from "@/stores/authStore";

interface ChatListProps {
  chats: ChatResponse[];
  isCompact?: boolean;
}

const ChatList: React.FC<ChatListProps> = React.memo(({ chats, isCompact = false }) => {
  console.log("chatList");
  const currentUserId = useAuthStore((state) => state.currentUser?.id || "");

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
      {chats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          isCompact={isCompact}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
});

export default ChatList;
