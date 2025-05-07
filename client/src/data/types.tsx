export interface UserProps {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone_number?: string;
    avatar?: string;
    last_seen?: Date;
    status?: string;
    birthday?: string;
    bio?: string;
  }
  
  export interface MediaProps {
    id: string;
    type: 'image' | 'video' | 'audio' | 'file';
    url: string;
    thumbnail?: string; // for videos
    file_name?: string;
    file_size?: number;
    duration?: number; // for audio/video
    width?: number; // for images/videos
    height?: number; // for images/videos
    mime_type?: string;
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
  
  export interface ChatProps {
    bio: string | undefined;
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