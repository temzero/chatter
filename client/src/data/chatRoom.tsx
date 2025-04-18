import { ChatRoomProps } from "./types";

export const chatRoomsData: Record<string, ChatRoomProps> = {
  'room1': {
    id: 'room1',
    type: 'private',
    members: ['user1', 'user2'],
    createdAt: new Date(Date.now() - 86400000),
    createdBy: 'user1',
    lastMessage: 'msg3',
    lastMessageTimestamp: new Date(Date.now() - 3600000).toISOString()
  },
  'room2': {
    id: 'room2',
    name: 'Tech Enthusiasts',
    description: 'Group for tech discussions',
    type: 'group',
    members: ['user1', 'user2', 'user3', 'user4'],
    admins: ['user1'],
    createdAt: new Date(Date.now() - 259200000),
    createdBy: 'user1',
    avatar: 'https://example.com/group-avatar.jpg',
    lastMessage: 'msg21',
    lastMessageTimestamp: new Date(Date.now() - 7200000).toISOString()
  },
  'room3': {
    id: 'room3',
    type: 'private',
    members: ['user3', 'user5'],
    createdAt: new Date(Date.now() - 172800000),
    createdBy: 'user3',
    lastMessage: 'msg35',
    lastMessageTimestamp: new Date(Date.now() - 1800000).toISOString()
  },
  'room4': {
    id: 'room4',
    type: 'private',
    members: ['user6', 'user7'],
    createdAt: new Date(Date.now() - 432000000),
    createdBy: 'user6',
    lastMessage: 'msg44',
    lastMessageTimestamp: new Date(Date.now() - 2400000).toISOString()
  },
  'room5': {
    id: 'room5',
    name: 'Book Club 📚',
    description: 'Discuss your favorite reads!',
    type: 'group',
    members: ['user2', 'user4', 'user8', 'user10'],
    admins: ['user4'],
    createdAt: new Date(Date.now() - 604800000),
    createdBy: 'user4',
    lastMessage: 'msg56',
    lastMessageTimestamp: new Date(Date.now() - 14400000).toISOString()
  },
  'room6': {
    id: 'room6',
    type: 'private',
    members: ['user9', 'user11'],
    createdAt: new Date(Date.now() - 100000000),
    createdBy: 'user11',
    lastMessage: 'msg63',
    lastMessageTimestamp: new Date(Date.now() - 3000000).toISOString()
  },
  'room7': {
    id: 'room7',
    name: 'Code Masters 💻',
    description: 'For coders and developers',
    type: 'group',
    members: ['user1', 'user3', 'user7', 'user11', 'user17'],
    admins: ['user3'],
    createdAt: new Date(Date.now() - 345600000),
    createdBy: 'user3',
    lastMessage: 'msg70',
    lastMessageTimestamp: new Date(Date.now() - 18000000).toISOString()
  },
  'room8': {
    id: 'room8',
    type: 'private',
    members: ['user10', 'user12'],
    createdAt: new Date(Date.now() - 288000000),
    createdBy: 'user10',
    lastMessage: 'msg82',
    lastMessageTimestamp: new Date(Date.now() - 2500000).toISOString()
  },
  'room9': {
    id: 'room9',
    type: 'private',
    members: ['user13', 'user14'],
    createdAt: new Date(Date.now() - 99999999),
    createdBy: 'user13',
    lastMessage: 'msg91',
    lastMessageTimestamp: new Date(Date.now() - 5000000).toISOString()
  },
  'room10': {
    id: 'room10',
    name: 'Photography Lovers 📸',
    description: 'Capture and share moments',
    type: 'group',
    members: ['user5', 'user9', 'user15', 'user20'],
    admins: ['user5'],
    createdAt: new Date(Date.now() - 777600000),
    createdBy: 'user5',
    lastMessage: 'msg100',
    lastMessageTimestamp: new Date(Date.now() - 6000000).toISOString()
  },
  'room11': {
    id: 'room11',
    type: 'private',
    members: ['user15', 'user16'],
    createdAt: new Date(Date.now() - 123456789),
    createdBy: 'user15',
    lastMessage: 'msg111',
    lastMessageTimestamp: new Date(Date.now() - 8000000).toISOString()
  },
  'room12': {
    id: 'room12',
    name: 'Gaming Central 🎮',
    description: 'Discuss latest games and strategies',
    type: 'group',
    members: ['user4', 'user6', 'user8', 'user18'],
    admins: ['user6'],
    createdAt: new Date(Date.now() - 86400000 * 4),
    createdBy: 'user6',
    lastMessage: 'msg123',
    lastMessageTimestamp: new Date(Date.now() - 12000000).toISOString()
  },
  'room13': {
    id: 'room13',
    type: 'private',
    members: ['user17', 'user18'],
    createdAt: new Date(Date.now() - 45000000),
    createdBy: 'user17',
    lastMessage: 'msg130',
    lastMessageTimestamp: new Date(Date.now() - 5400000).toISOString()
  },
  'room14': {
    id: 'room14',
    type: 'private',
    members: ['user19', 'user20'],
    createdAt: new Date(Date.now() - 123000000),
    createdBy: 'user19',
    lastMessage: 'msg142',
    lastMessageTimestamp: new Date(Date.now() - 9000000).toISOString()
  },
  'room15': {
    id: 'room15',
    name: 'Announcements 📢',
    description: 'Official updates and news',
    type: 'channel',
    members: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10'],
    admins: ['user1'],
    createdAt: new Date(Date.now() - 604800000),
    createdBy: 'user1',
    isMuted: true,
    avatar: 'https://example.com/announcement.jpg',
    lastMessage: 'msg150',
    lastMessageTimestamp: new Date(Date.now() - 3600000).toISOString()
  },
  'room16': {
    id: 'room16',
    name: 'Designers Hub 🎨',
    description: 'Creatives and designers share ideas',
    type: 'group',
    members: ['user11', 'user12', 'user14', 'user16'],
    admins: ['user14'],
    createdAt: new Date(Date.now() - 300000000),
    createdBy: 'user14',
    lastMessage: 'msg164',
    lastMessageTimestamp: new Date(Date.now() - 1000000).toISOString()
  },
  'room17': {
    id: 'room17',
    type: 'private',
    members: ['user13', 'user5'],
    createdAt: new Date(Date.now() - 180000000),
    createdBy: 'user13',
    lastMessage: 'msg177',
    lastMessageTimestamp: new Date(Date.now() - 300000).toISOString()
  },
  'room18': {
    id: 'room18',
    type: 'private',
    members: ['user8', 'user17'],
    createdAt: new Date(Date.now() - 190000000),
    createdBy: 'user8',
    lastMessage: 'msg188',
    lastMessageTimestamp: new Date(Date.now() - 2000000).toISOString()
  },
  'room19': {
    id: 'room19',
    name: 'Silent Mode 🔕',
    description: 'Shhh... It’s muted',
    type: 'channel',
    members: ['user2', 'user7', 'user13', 'user19'],
    admins: ['user2'],
    createdAt: new Date(Date.now() - 660000000),
    createdBy: 'user2',
    isMuted: true,
    lastMessage: 'msg199',
    lastMessageTimestamp: new Date(Date.now() - 4700000).toISOString()
  },
  'room20': {
    id: 'room20',
    name: 'Pinboard 📌',
    description: 'Group with pinned messages',
    type: 'group',
    members: ['user1', 'user6', 'user10', 'user15'],
    admins: ['user6'],
    pinnedMessages: ['msg42', 'msg105'],
    createdAt: new Date(Date.now() - 240000000),
    createdBy: 'user6',
    lastMessage: 'msg205',
    lastMessageTimestamp: new Date(Date.now() - 1500000).toISOString()
  }
};
