import { chatRoomsData } from "./chatRoom";
import { mediaData } from "./media";
import { messagesData } from "./message";
import { myProfileData } from "./profile";
import { usersData } from "./user";

export {
  chatRoomsData, mediaData, messagesData, myProfileData, usersData
}

// Indexes for quick lookup
export const userChatRoomsIndex: Record<string, string[]> = {
  'user1': ['room1', 'room2'],
  'user2': ['room1', 'room2']
};

export const chatRoomMessagesIndex: Record<string, string[]> = {
  'room1': ['msg1', 'msg2', 'msg3'],
  'room2': []
};