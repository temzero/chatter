import { MessageResponse } from "@/types/responses/message.response";
import { CallStatus } from "@/types/enums/CallStatus";

export const handleCallMessage = (message: MessageResponse) => {
  if (!message.call) {
    console.log("not a call message");
    return;
  }

  const callStatus = message.call.status;

  switch (callStatus) {
    case CallStatus.DIALING:
      console.log("[Call Message] DIALING");
      break;

    case CallStatus.IN_PROGRESS:
      console.log("[Call Message] IN_PROGRESS");
      break;

    case CallStatus.COMPLETED:
      console.log("[Call Message] COMPLETED");
      break;
    case CallStatus.MISSED:
      console.log("[Call Message] MISSED");
      break;
    case CallStatus.FAILED:
      console.log("[Call Message] FAILED");
      break;

    default:
      console.warn("Unknown call status:", status);
      break;
  }
};
