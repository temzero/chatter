// import React, { useRef, useEffect } from "react";
// import DirectMessages from "./DirectMessages";
// import GroupMessages from "./GroupMessages";
// import ChannelMessages from "./ChannelMessages";
// import TypingIndicator from "../../ui/typingIndicator/TypingIndicator";
// import type { ChatResponse } from "@/types/responses/chat.response";
// import { useMessagesByChatId } from "@/stores/messageStore";
// import { ChatType } from "@/types/enums/ChatType";

// interface ChatBoxProps {
//   chat?: ChatResponse;
// }

// const ChatBox: React.FC<ChatBoxProps> = ({ chat }) => {
//   console.log("CHAT BOX RENDERED");
//   const chatId = chat?.id || "";
//   const messages = useMessagesByChatId(chatId);
//   console.log("messages", messages);

//   const containerRef = useRef<HTMLDivElement | null>(null);

//   const scrollToBottom = () => {
//     if (containerRef.current) {
//       containerRef.current.scrollTop = containerRef.current.scrollHeight;
//     }
//   };

//   const prevMessagesLengthRef = useRef(0);
//   const hasScrolledInitially = useRef(false);

//   useEffect(() => {
//     const prevLength = prevMessagesLengthRef.current;
//     const currLength = messages.length;

//     const lastMsg = messages[currLength - 1];
//     const prevLastMsg = messages[prevLength - 1];

//     const isNewMessage =
//       currLength > prevLength && lastMsg?.id !== prevLastMsg?.id;

//     const isFirstLoad = !hasScrolledInitially.current && currLength > 0;

//     if ((isNewMessage || isFirstLoad) && chatId !== "") {
//       scrollToBottom();
//       hasScrolledInitially.current = true;
//     }

//     prevMessagesLengthRef.current = currLength;
//   }, [chatId, messages]);

//   const renderMessages = () => {
//     if (!chat) return null;

//     switch (chat.type) {
//       case ChatType.DIRECT:
//         return <DirectMessages chat={chat} messages={messages} />;
//       case ChatType.GROUP:
//         return <GroupMessages chat={chat} messages={messages} />;
//       case ChatType.CHANNEL:
//         return <ChannelMessages chat={chat} messages={messages} />;
//       default:
//         return <DirectMessages chat={chat} messages={messages} />;
//     }
//   };

//   return (
//     <div
//       ref={containerRef}
//       className="px-6 py-16 pb-[160px] flex-1 h-full w-full flex flex-col overflow-x-hidden overflow-y-auto backdrop-blur-sm"
//     >
//       {renderMessages()}
//       <TypingIndicator chatId={chatId} />
//     </div>
//   );
// };

// export default React.memo(ChatBox);

import React, { useRef, useEffect } from "react";
import DirectMessages from "./DirectMessages";
import GroupMessages from "./GroupMessages";
import ChannelMessages from "./ChannelMessages";
import TypingIndicator from "../../ui/typingIndicator/TypingIndicator";
import type { ChatResponse } from "@/types/responses/chat.response";
import { useMessagesByChatId } from "@/stores/messageStore";
import { ChatType } from "@/types/enums/ChatType";

interface ChatBoxProps {
  chat?: ChatResponse;
}

const ChatBox: React.FC<ChatBoxProps> = ({ chat }) => {
  const chatId = chat?.id || "";
  const messages = useMessagesByChatId(chatId);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  const prevMessagesLengthRef = useRef(0);
  const hasScrolledInitially = useRef(false);

  useEffect(() => {
    const prevLength = prevMessagesLengthRef.current;
    const currLength = messages.length;

    const lastMsg = messages[currLength - 1];
    const prevLastMsg = messages[prevLength - 1];

    const isNewMessage =
      currLength > prevLength && lastMsg?.id !== prevLastMsg?.id;

    const isFirstLoad = !hasScrolledInitially.current && currLength > 0;

    if ((isNewMessage || isFirstLoad) && chatId !== "") {
      scrollToBottom();
      hasScrolledInitially.current = true;
    }

    prevMessagesLengthRef.current = currLength;
  }, [chatId, messages]);

  const renderMessages = () => {
    if (!chat) return null;

    switch (chat.type) {
      case ChatType.DIRECT:
        return <DirectMessages chat={chat} messages={messages} />;
      case ChatType.GROUP:
        return <GroupMessages chat={chat} messages={messages} />;
      case ChatType.CHANNEL:
        return <ChannelMessages chat={chat} messages={messages} />;
      default:
        return <DirectMessages chat={chat} messages={messages} />;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative px-6 py-16 pb-[160px] flex-1 h-full w-full flex flex-col overflow-x-hidden overflow-y-auto"
    >
      {renderMessages()}
      <TypingIndicator chatId={chatId} />
    </div>
  );
};

export default React.memo(ChatBox);
