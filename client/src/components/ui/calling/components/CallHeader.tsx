import { ChatResponse } from "@/types/responses/chat.response";
import { ChatAvatar } from "../../avatar/ChatAvatar";

// components/call/CallHeader.tsx
export const CallHeader = ({ chat }: { chat: ChatResponse }) => (
  <div className="flex flex-col items-center z-20">
    <ChatAvatar chat={chat} type="call" />
    <h2 className="text-xl font-semibold mt-2">{chat.name}</h2>
  </div>
);
