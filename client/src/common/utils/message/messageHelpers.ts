// src/utils/messageHelpers.ts
import { MessageResponse } from "@/shared/types/responses/message.response";

export interface MessagesByDateGroup {
  date: string;
  messages: MessageResponse[];
}

export function groupMessagesByDate(
  messages: MessageResponse[]
): MessagesByDateGroup[] {
  const groups: MessagesByDateGroup[] = [];

  for (const msg of messages) {
    const date = new Date(msg.createdAt).toLocaleDateString();
    const lastGroup = groups[groups.length - 1];

    if (!lastGroup || lastGroup.date !== date) {
      groups.push({ date, messages: [msg] });
    } else {
      lastGroup.messages.push(msg);
    }
  }

  return groups;
}

export function shouldShowInfo(
  currentMsg: MessageResponse,
  nextMsg: MessageResponse | undefined
): boolean {
  const nextIsSystemEvent = !!nextMsg?.systemEvent;

  // Show info if:
  // 1. There is no next message
  // 2. Next message is from a different sender
  // 3. Next message is a system event
  return (
    !nextMsg || nextMsg.sender.id !== currentMsg.sender.id || nextIsSystemEvent
  );
}

export function isRecentMessage(
  currentMsg: MessageResponse,
  prevMsg: MessageResponse | undefined,
  nextMsg: MessageResponse | undefined,
  periodMs: number = 10 * 60 * 1000
): boolean {
  const currentTime = new Date(currentMsg.createdAt).getTime();

  const prevIsRecent = !!(
    prevMsg &&
    prevMsg.sender.id === currentMsg.sender.id &&
    !prevMsg.systemEvent && // treat system messages as breaking the chain
    currentTime - new Date(prevMsg.createdAt).getTime() <= periodMs
  );

  const nextIsRecent = !!(
    nextMsg &&
    nextMsg.sender.id === currentMsg.sender.id &&
    !nextMsg.systemEvent && // treat system messages as breaking the chain
    new Date(nextMsg.createdAt).getTime() - currentTime <= periodMs
  );

  // If previous is recent but next is not, current is not recent
  if (prevIsRecent && !nextIsRecent) return false;

  return prevIsRecent || nextIsRecent;
}
