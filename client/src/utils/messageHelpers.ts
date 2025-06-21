// src/utils/messageHelpers.ts
import { MessageResponse } from "@/types/messageResponse";

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
  _prevMsg: MessageResponse | undefined,
  nextMsg: MessageResponse | undefined
): boolean {
  return !nextMsg || nextMsg.senderId !== currentMsg.senderId;
}

export function isRecentMessage(
  currentMsg: MessageResponse,
  prevMsg: MessageResponse | undefined,
  nextMsg: MessageResponse | undefined,
  periodMs: number = 10 * 60 * 1000
): boolean {
  const currentTime = new Date(currentMsg.createdAt).getTime();

  const prevIsRecent =
    !!(
      prevMsg &&
      prevMsg.senderId === currentMsg.senderId &&
      currentTime - new Date(prevMsg.createdAt).getTime() <= periodMs
    );

  const nextIsRecent =
    !!(
      nextMsg &&
      nextMsg.senderId === currentMsg.senderId &&
      new Date(nextMsg.createdAt).getTime() - currentTime <= periodMs
    );

  if (prevIsRecent && !nextIsRecent) return false;

  return prevIsRecent || nextIsRecent;
}
