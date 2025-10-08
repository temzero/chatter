import { ChatResponse } from "@/types/responses/chat.response";
import { ChatAvatar } from "../../avatar/ChatAvatar";

export const CallHeader = ({
  chat,
  className = "",
}: {
  chat: ChatResponse;
  className?: string;
}) => (
  <div
    className={`flex flex-col items-center ${className}`}
    style={{ zIndex: 1 }}
  >
    <ChatAvatar chat={chat} type="call" />
    <h2 className="text-xl font-semibold mt-2">{chat.name}</h2>
  </div>
);
