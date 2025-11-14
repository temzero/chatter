import React from "react";
import { AnimatePresence } from "framer-motion";
import ChatListItem from "./ChatListItem";
import InfiniteScroller from "@/components/ui/layout/InfiniteScroller";
import { getCurrentUserId } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
interface ChatListProps {
  chatIds: string[]; // Changed from chats to chatIds
  isCompact?: boolean;
}

const ChatList: React.FC<ChatListProps> = React.memo(
  ({ chatIds, isCompact = false }) => {
    console.log("[MOUNTED]", "ChatList", chatIds.length);
    const currentUserId = getCurrentUserId();
    const hasMoreChats = useChatStore((state) => state.hasMoreChats);
    const fetchMoreChats = useChatStore.getState().fetchMoreChats;

    if (!currentUserId) {
      console.error("No User Data");
      return;
    }

    return (
      <InfiniteScroller
        onLoadMore={fetchMoreChats}
        hasMore={hasMoreChats}
        loader={
          <div className="p-4 text-center opacity-40">
            Loading more chats...
          </div>
        }
        className="flex-1 relative"
      >
        <AnimatePresence initial={false}>
          {chatIds.map((chatId) => (
            <ChatListItem
              key={chatId}
              chatId={chatId}
              isCompact={isCompact}
              currentUserId={currentUserId}
            />
          ))}
        </AnimatePresence>
      </InfiniteScroller>
    );
  }
);

export default ChatList;
