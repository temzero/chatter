import React from "react";
import ChatListItem from "./ChatListItem";
import InfiniteScroller from "@/components/ui/layout/InfiniteScroller";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useShallow } from "zustand/shallow";
import type { ChatResponse } from "@/shared/types/responses/chat.response";

interface ChatListProps {
  chats: ChatResponse[];
  isCompact?: boolean;
}

const ChatList: React.FC<ChatListProps> = React.memo(
  ({ chats, isCompact = false }) => {
    const currentUserId = useAuthStore((state) => state.currentUser?.id || "");
    const { fetchMoreChats, hasMoreChats } = useChatStore(
      useShallow((state) => ({
        fetchMoreChats: state.fetchMoreChats,
        hasMoreChats: state.hasMoreChats,
      }))
    );

    // const ids = chats.map((c) => c.id);
    // console.log("chatIds", ids);
    // console.log(
    //   "Duplicate chat IDs:",
    //   ids.filter((v, i, a) => a.indexOf(v) !== i)
    // );

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
        {chats.map((chat) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            isCompact={isCompact}
            currentUserId={currentUserId}
          />
        ))}
        {/* {!hasMoreChats && chats.length > 0 && (
          <div className="p-2 text-center opacity-40">No more chats</div>
        )} */}
      </InfiniteScroller>
    );
  }
);

export default ChatList;
