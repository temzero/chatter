// src/utils/messageHelpers.ts
import { MessageResponse } from "@/shared/types/responses/message.response";

export interface MessagesByDateGroup {
  date: string;
  messages: MessageResponse[];
}

export function groupMessagesByDate(
  messages: MessageResponse[],
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

export interface FlatListItem {
  type: 'date' | 'message';
  id: string;        // Unique React key
  timestamp: number; // For sorting/stable keys
  data: MessageResponse | string; // The actual content
}

export function flattenMessagesWithDates(
  messages: MessageResponse[],
): FlatListItem[] {
  const items: FlatListItem[] = [];
  let lastDateKey = "";

  for (const msg of messages) {
    const date = new Date(msg.createdAt);
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

    // Add date header if new date
    if (dateKey !== lastDateKey) {
      const dayStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      ).getTime();

      items.push({
        type: "date",
        id: `date-${msg.id}`, // Use message ID for uniqueness
        timestamp: dayStart,
        data: date.toLocaleDateString(), // Or pass timestamp and format in component
      });

      lastDateKey = dateKey;
    }

    // Add message
    items.push({
      type: "message",
      id: msg.id,
      timestamp: new Date(msg.createdAt).getTime(),
      data: msg,
    });
  }

  return items;
}

export function shouldShowInfo(
  currentMsg: MessageResponse,
  nextMsg: MessageResponse | undefined,
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
  periodMs: number = 10 * 60 * 1000,
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
