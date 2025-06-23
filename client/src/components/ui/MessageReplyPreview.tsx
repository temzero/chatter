import { MessageResponse } from "@/types/messageResponse";

export const MessageReplyPreview = ({
  message,
}: {
  message: MessageResponse;
}) => (
  <div className="text-sm text-gray-500 px-3 py-1 border-l-4 mb-1 rounded border-gray-400 bg-gray-50">
    <div className="font-semibold text-gray-700">
      {message.senderNickname || message.senderFirstName}
    </div>
    <div className="truncate text-gray-600">
      {message.content || "[media/attachment]"}
    </div>
  </div>
);
