export interface BaseChatProps {
    id: string;
    members: string[];
    createdAt: Date;
    createdBy: string;
    lastMessage?: string;
    isArchived?: boolean;
    isMuted?: boolean;
    pinnedMessages?: string[];
  }

export interface PrivateChatProps extends BaseChatProps {
    type: 'private';
    // No additional fields (private chats are minimal)
  }

  export interface GroupOrChannelChatProps extends BaseChatProps {
    type: 'group' | 'channel';
    avatar?: string;
    name: string; // Required (unlike optional in your original)
    description?: string;
    admins: string[]; // Required (groups/channels must have admins)
    // Additional type-specific fields (optional):
    isPublic?: boolean; // For channels (join without invite)
    isBroadcastOnly?: boolean; // For channels (admins-only posting)
  }

export const testChats: Array<PrivateChatProps | GroupOrChannelChatProps> = [
    // Private chats
    {
      id: "priv-1",
      type: "private",
      members: ["user1", "user2"],
      createdAt: new Date("2023-01-15T10:30:00Z"),
      createdBy: "user1",
      lastMessage: "Hey, how are you doing?",
      isMuted: true
    },
    {
      id: "priv-2",
      type: "private",
      members: ["user3", "user4"],
      createdAt: new Date("2023-02-20T14:15:00Z"),
      createdBy: "user3",
      lastMessage: "Let's meet tomorrow",
      isArchived: true
    },
  
    // Group chats
    {
      id: "group-1",
      type: "group",
      name: "Family Group",
      members: ["user1", "user3", "user5", "user7"],
      createdAt: new Date("2022-12-01T08:00:00Z"),
      createdBy: "user1",
      lastMessage: "Mom: Dinner at 7pm!",
      admins: ["user1", "user3"],
      avatar: "https://example.com/avatars/family.jpg",
      description: "Our family chat",
      pinnedMessages: ["msg-123", "msg-456"]
    },
    {
      id: "group-2",
      type: "group",
      name: "Work Team",
      members: ["user2", "user4", "user6", "user8"],
      createdAt: new Date("2023-03-10T09:00:00Z"),
      createdBy: "user2",
      lastMessage: "Alice: I've sent the report",
      admins: ["user2"],
      isMuted: true
    },
  
    // Public channels
    {
      id: "channel-1",
      type: "channel",
      name: "Tech News",
      members: ["user1", "user2", "user5", "user9", "user10"],
      createdAt: new Date("2023-01-05T12:00:00Z"),
      createdBy: "user9",
      lastMessage: "New React version released!",
      admins: ["user9", "user10"],
      description: "Latest in technology",
      isPublic: true,
      isBroadcastOnly: true
    },
    {
      id: "channel-2",
      type: "channel",
      name: "Random Discussions",
      members: ["user3", "user4", "user7", "user8"],
      createdAt: new Date("2023-02-28T16:45:00Z"),
      createdBy: "user3",
      lastMessage: "Check out this funny video!",
      admins: ["user3"],
      isPublic: true
    },
  
    // Private groups/channels
    {
      id: "group-3",
      type: "group",
      name: "Secret Project",
      members: ["user1", "user6", "user10"],
      createdAt: new Date("2023-04-01T00:00:00Z"),
      createdBy: "user10",
      lastMessage: "The prototype is ready",
      admins: ["user10"],
      isArchived: true,
      pinnedMessages: ["msg-789"]
    },
    {
      id: "channel-3",
      type: "channel",
      name: "Announcements",
      members: ["user1", "user2", "user3", "user4", "user5"],
      createdAt: new Date("2023-03-15T11:30:00Z"),
      createdBy: "user1",
      lastMessage: "System maintenance tonight",
      admins: ["user1"],
      isBroadcastOnly: true
    },
  
    // Minimal group
    {
      id: "group-4",
      type: "group",
      name: "Study Group",
      members: ["user5", "user6"],
      createdAt: new Date("2023-04-10T18:00:00Z"),
      createdBy: "user5",
      admins: ["user5"]
    },
  
    // Channel with no last message
    {
      id: "channel-4",
      type: "channel",
      name: "Empty Channel",
      members: ["user7"],
      createdAt: new Date("2023-04-18T10:00:00Z"),
      createdBy: "user7",
      admins: ["user7"],
      description: "This channel has no messages yet"
    }
  ];