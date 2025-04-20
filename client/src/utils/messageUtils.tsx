// utils/messageUtils.ts
import type { MessageProps } from '@/data/message';

export function createMessagesIndex(messages: MessageProps[]): Map<number, MessageProps[]> {
  const index = new Map<number, MessageProps[]>();
  
  messages.forEach(message => {
    if (!index.has(message.chatId)) {
      index.set(message.chatId, []);
    }
    index.get(message.chatId)!.push(message);
  });

  // Sort messages by time within each chat (if needed)
  index.forEach(messages => {
    messages.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  });

  return index;
}