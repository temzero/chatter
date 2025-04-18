export interface UserProps {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  avatar?: string;
  lastSeen?: Date;
  isOnline: boolean;
  status?: string;
  birthday?: string;
  bio?: string;
}

export interface MediaProps {
  id: string;
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  thumbnail?: string; // for videos
  fileName?: string;
  fileSize?: number;
  duration?: number; // for audio/video
  width?: number; // for images/videos
  height?: number; // for images/videos
  mimeType?: string;
  uploadedAt: Date;
  uploadedBy: string; // user ID
}

export interface MessageProps {
  id: string;
  chatRoomId: string;
  senderId: string;
  content?: string;
  mediaIds?: string[]; // references to Media objects
  timestamp: Date;
  edited?: boolean;
  editedAt?: Date;
  deleted?: boolean;
  deletedAt?: Date;
  replyToId?: string; // ID of message being replied to
  reactions?: Record<string, string[]>; // { "emoji": ["userId1", "userId2"] }
  readBy?: string[]; // array of user IDs who read the message
}

export interface ChatRoomProps {
  id: string;
  name?: string; // for groups/channels
  description?: string; // for groups/channels
  type: 'private' | 'group' | 'channel';
  members: string[]; // array of user IDs
  admins?: string[]; // array of user IDs (for groups/channels)
  createdAt: Date;
  createdBy: string; // user ID
  lastMessage?: string; // message ID
  lastMessageTimestamp?: string;
  avatar?: string;
  isArchived?: boolean;
  isMuted?: boolean;
  pinnedMessages?: string[]; // array of message IDs
}

export interface MyProfileProps extends UserProps {
  email?: string;
  bio?: string;
  settings: {
    theme: 'light' | 'dark' | 'system';
    notificationSound: boolean;
    privacy: {
      lastSeen: 'everyone' | 'contacts' | 'nobody';
      profilePhoto: 'everyone' | 'contacts' | 'nobody';
    };
  };
  blockedUsers: string[]; // array of user IDs
  contacts: string[]; // array of user IDs
}

// export interface ChatProps {
//     id: number;
//     name?: string;
//     lastMessage: string;
//     time: string;
//     type: string;
//     unread?: number;
//     avatar?: string;
//     isGroup?: boolean;
//   }

//   export interface MessageProps {
//     id: number;
//     chatId: number;
//     senderId: number;
//     senderName: string;
//     content: string;
//     timestamp: string;
//     isMe: boolean;
//     media?: MediaProps; // Optional media attachment
//     status?: 'sent' | 'delivered' | 'read';
//   }
  
//   export interface MediaProps {
//     id: number;
//     chatId: number;
//     senderId: number;
//     type: 'image' | 'video' | 'voice' | 'file';
//     url: string;
//     thumbnail?: string;
//     duration?: number;
//     size?: string;
//     fileName?: string;
//     timestamp: string;
//   }
  
//   export interface MyProfileProps {
//     username: string;
//     firstName: string;
//     lastName: string;
//     email?: string;
//     phone?: string;
//     birthday?: string;
//     bio?: string;
//     avatar?: string;
//   }
  
//   export type GroupedByChatId<T> = Record<number, T[]>;