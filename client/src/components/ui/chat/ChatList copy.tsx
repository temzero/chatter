// import React from "react";
// import { AnimatePresence } from "framer-motion";
// import ChatListItem from "./ChatListItem";
// import InfiniteScroller from "@/components/ui/layout/InfiniteScroller";
// import { useCurrentUserId } from "@/stores/authStore";
// import { useChatStore } from "@/stores/chatStore";
// import type { ChatResponse } from "@/shared/types/responses/chat.response";

// interface ChatListProps {
//   chats: ChatResponse[];
//   isCompact?: boolean;
// }

// const ChatList: React.FC<ChatListProps> = React.memo(
//   ({ chats, isCompact = false }) => {
//     console.log("ChatList", chats.length);
//     const currentUserId = useCurrentUserId();
//     const hasMoreChats = useChatStore((state) => state.hasMoreChats);
//     const fetchMoreChats = useChatStore.getState().fetchMoreChats;
//     if (!currentUserId) return;

//     // Sort chats: pinned first, then by updatedAt descending
//     const sortedChats = [...chats].sort((a, b) => {
//       const aPinned = a.pinnedAt ? new Date(a.pinnedAt).getTime() : 0;
//       const bPinned = b.pinnedAt ? new Date(b.pinnedAt).getTime() : 0;

//       if (aPinned && bPinned) {
//         return bPinned - aPinned; // both pinned: newest first
//       }
//       if (aPinned) return -1; // a pinned, b not
//       if (bPinned) return 1; // b pinned, a not

//       // neither pinned: fallback to updatedAt
//       const aUpdated = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
//       const bUpdated = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
//       return bUpdated - aUpdated;
//     });

//     return (
//       <InfiniteScroller
//         onLoadMore={fetchMoreChats}
//         hasMore={hasMoreChats}
//         loader={
//           <div className="p-4 text-center opacity-40">
//             Loading more chats...
//           </div>
//         }
//         className="flex-1 relative"
//       >
//         <AnimatePresence initial={false}>
//           {sortedChats.map((chat) => (
//             <ChatListItem
//               key={chat.id}
//               chat={chat}
//               isCompact={isCompact}
//               currentUserId={currentUserId}
//             />
//           ))}
//           {/* {!hasMoreChats && chats.length > 0 && (
//           <div className="p-2 text-center opacity-40">No more chats</div>
//         )} */}
//         </AnimatePresence>
//       </InfiniteScroller>
//     );
//   }
// );

// export default ChatList;
