// import React, { useMemo, useEffect } from "react";
// import { MessageResponse } from "@/shared/types/responses/message.response";
// import { ChatResponse } from "@/shared/types/responses/chat.response";
// import { getCurrentUser } from "@/stores/authStore";
// import { chatWebSocketService } from "@/services/websocket/chat.websocket.service";
// import { getMyActiveChatMember } from "@/stores/chatMemberStore";
// import { AnimatePresence } from "framer-motion";
// import ChannelMessage from "../components/message/MessageChannel";

// interface ChannelMessagesProps {
//   chat: ChatResponse;
//   messages: MessageResponse[];
// }

// const ChannelMessages: React.FC<ChannelMessagesProps> = ({
//   chat,
//   messages,
// }) => {
//   console.log("ChannelMessages");
//   const chatId = chat?.id;
//   const currentUser = getCurrentUser();
//   const myMember = getMyActiveChatMember(chat.myMemberId);

//   const myLastReadMessageId = myMember?.lastReadMessageId ?? null;

//   // Send read receipt if the last message is unread and not sent by you
//   useEffect(() => {
//     if (!chatId || !chat.myMemberId || messages.length === 0) return;

//     const lastMessage = messages[messages.length - 1];
//     const isFromOther = lastMessage.sender?.id !== currentUser?.id;
//     const isUnread =
//       myLastReadMessageId === null || lastMessage.id !== myLastReadMessageId;

//     if (isUnread && isFromOther) {
//       const timer = setTimeout(() => {
//         chatWebSocketService.messageRead(
//           chatId,
//           chat.myMemberId,
//           lastMessage.id
//         );
//       }, 1000);

//       return () => clearTimeout(timer);
//     }
//   }, [chatId, chat.myMemberId, messages, myLastReadMessageId, currentUser?.id]);

//   const messagesByDate = useMemo(() => {
//     const groups: { date: string; messages: MessageResponse[] }[] = [];

//     messages.forEach((msg) => {
//       const messageDate = new Date(msg.createdAt).toLocaleDateString();
//       const lastGroup = groups[groups.length - 1];

//       if (!lastGroup || lastGroup.date !== messageDate) {
//         groups.push({
//           date: messageDate,
//           messages: [msg],
//         });
//       } else {
//         lastGroup.messages.push(msg);
//       }
//     });

//     return groups;
//   }, [messages]);

//   if (messages.length === 0) {
//     return (
//       <div className="h-full w-full flex items-center justify-center opacity-50 italic text-xl">
//         No messages yet!
//       </div>
//     );
//   }

//   return (
//     <>
//       {messagesByDate.map((group) => (
//         <React.Fragment key={`${group.date}-${chatId}`}>
//           <div
//             className="sticky top-0 flex justify-center my-2"
//             style={{ zIndex: 1 }}
//           >
//             <div className="bg-[var(--background-color)] text-xs p-1 rounded">
//               {group.date || "Today"}
//             </div>
//           </div>

//           <AnimatePresence initial={false}>
//             {group.messages.map((msg, index) => {
//               const nextMsg = group.messages[index + 1];
//               const isLastRead =
//                 myLastReadMessageId === msg.id &&
//                 (!nextMsg || nextMsg.id !== myLastReadMessageId);

//               const isMe = msg.sender.id === currentUser?.id;

//               return (
//                 <div
//                   key={msg.id}
//                   className="flex flex-col items-center"
//                   // layout
//                 >
//                   <ChannelMessage message={msg} />
//                   {isLastRead && !isMe && (
//                     <div className="relative flex items-center gap-1 justify-between text-xs italic w-full select-none text-white">
//                       <div
//                         className="h-4 flex items-center bg-[--primary-green] rounded-full px-0.5"
//                         style={{ zIndex: 1 }}
//                       >
//                         <span className="material-symbols-outlined text-xl">
//                           visibility
//                         </span>
//                       </div>
//                       <div
//                         className="h-4 flex items-center bg-[--primary-green] rounded-full px-2"
//                         style={{ zIndex: 1 }}
//                       >
//                         Last Read
//                       </div>
//                       <div className="absolute left-0 right-0 h-[2px] bg-[--primary-green] top-1/2 -translate-y-1/2"></div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </AnimatePresence>
//         </React.Fragment>
//       ))}
//     </>
//   );
// };

// export default React.memo(ChannelMessages);
