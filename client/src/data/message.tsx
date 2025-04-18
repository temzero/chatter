import { MessageProps } from "./types";

export const messagesData: Record<string, MessageProps> = {
  // Room 1 messages (general chat)
  'msg1': {
    id: 'msg1',
    chatRoomId: 'room1',
    senderId: 'user1',
    content: 'Good morning everyone! 🌞',
    timestamp: new Date(Date.now() - 86400000),
    readBy: ['user2', 'user3', 'user4'],
    reactions: { '👍': ['user2', 'user5'] }
  },
  'msg2': {
    id: 'msg2',
    chatRoomId: 'room1',
    senderId: 'user3',
    content: 'Morning! Ready for the meeting later?',
    timestamp: new Date(Date.now() - 82800000),
    readBy: ['user1', 'user2', 'user4'],
    replyToId: 'msg1'
  },
  'msg3': {
    id: 'msg3',
    chatRoomId: 'room1',
    senderId: 'user5',
    mediaIds: ['media1'],
    content: 'Check out this design I made!',
    timestamp: new Date(Date.now() - 79200000),
    readBy: ['user1', 'user2', 'user3', 'user4']
  },

  // Room 2 messages (work projects)
  'msg4': {
    id: 'msg4',
    chatRoomId: 'room2',
    senderId: 'user7',
    content: 'The deadline for the project is next Friday',
    timestamp: new Date(Date.now() - 72000000),
    readBy: ['user8', 'user9', 'user10'],
    reactions: { '😮': ['user8'], '💪': ['user9'] }
  },
  'msg5': {
    id: 'msg5',
    chatRoomId: 'room2',
    senderId: 'user10',
    content: 'I\'ve pushed the latest changes to the staging branch',
    timestamp: new Date(Date.now() - 68400000),
    readBy: ['user7', 'user8', 'user9']
  },
  'msg6': {
    id: 'msg6',
    chatRoomId: 'room2',
    senderId: 'user8',
    mediaIds: ['media2', 'media3'],
    content: 'Here are the screenshots of the bugs I found',
    timestamp: new Date(Date.now() - 64800000),
    readBy: ['user7', 'user9', 'user10']
  },

  // Room 3 messages (friends group)
  'msg7': {
    id: 'msg7',
    chatRoomId: 'room3',
    senderId: 'user12',
    content: 'Who\'s up for dinner this weekend?',
    timestamp: new Date(Date.now() - 57600000),
    readBy: ['user11', 'user13', 'user14'],
    reactions: { '🍕': ['user11', 'user14'] }
  },
  'msg8': {
    id: 'msg8',
    chatRoomId: 'room3',
    senderId: 'user13',
    content: 'I\'m in! How about Italian?',
    timestamp: new Date(Date.now() - 54000000),
    readBy: ['user11', 'user12', 'user14'],
    replyToId: 'msg7'
  },
  'msg9': {
    id: 'msg9',
    chatRoomId: 'room3',
    senderId: 'user11',
    content: 'Sounds perfect! 7pm work for everyone?',
    timestamp: new Date(Date.now() - 50400000),
    readBy: ['user12', 'user13', 'user14'],
    replyToId: 'msg8'
  },

  // Room 4 messages (family chat)
  'msg10': {
    id: 'msg10',
    chatRoomId: 'room4',
    senderId: 'user15',
    content: 'Don\'t forget about mom\'s birthday tomorrow!',
    timestamp: new Date(Date.now() - 43200000),
    readBy: ['user16', 'user17', 'user18'],
    reactions: { '🎂': ['user16', 'user17', 'user18'] }
  },
  'msg11': {
    id: 'msg11',
    chatRoomId: 'room4',
    senderId: 'user16',
    mediaIds: ['media4'],
    content: 'I made this cake for her!',
    timestamp: new Date(Date.now() - 39600000),
    readBy: ['user15', 'user17', 'user18']
  },
  'msg12': {
    id: 'msg12',
    chatRoomId: 'room4',
    senderId: 'user18',
    content: 'It looks amazing! She\'ll love it ❤️',
    timestamp: new Date(Date.now() - 36000000),
    readBy: ['user15', 'user16', 'user17'],
    replyToId: 'msg11'
  },

  // Room 5 messages (hobby group)
  'msg13': {
    id: 'msg13',
    chatRoomId: 'room5',
    senderId: 'user19',
    content: 'Has anyone tried the new photography spot downtown?',
    timestamp: new Date(Date.now() - 28800000),
    readBy: ['user20', 'user1', 'user2'],
    reactions: { '📷': ['user20'] }
  },
  'msg14': {
    id: 'msg14',
    chatRoomId: 'room5',
    senderId: 'user20',
    mediaIds: ['media5'],
    content: 'Yes! Took this there yesterday',
    timestamp: new Date(Date.now() - 25200000),
    readBy: ['user19', 'user1', 'user2']
  },
  'msg15': {
    id: 'msg15',
    chatRoomId: 'room5',
    senderId: 'user1',
    content: 'Wow, that\'s an incredible shot! What camera did you use?',
    timestamp: new Date(Date.now() - 21600000),
    readBy: ['user19', 'user20', 'user2'],
    replyToId: 'msg14'
  },

  // Additional messages across various rooms
  'msg16': {
    id: 'msg16',
    chatRoomId: 'room6',
    senderId: 'user3',
    content: 'The server maintenance is scheduled for 2am tonight',
    timestamp: new Date(Date.now() - 18000000),
    readBy: ['user4', 'user5', 'user6'],
    reactions: { '⚠️': ['user4'] }
  },
  'msg17': {
    id: 'msg17',
    chatRoomId: 'room7',
    senderId: 'user7',
    content: 'Can someone review my PR when you get a chance?',
    timestamp: new Date(Date.now() - 14400000),
    readBy: ['user8', 'user9'],
    edited: true,
    editedAt: new Date(Date.now() - 14000000)
  },
  'msg18': {
    id: 'msg18',
    chatRoomId: 'room8',
    senderId: 'user10',
    mediaIds: ['media6'],
    timestamp: new Date(Date.now() - 10800000),
    readBy: ['user11', 'user12']
  },
  'msg19': {
    id: 'msg19',
    chatRoomId: 'room9',
    senderId: 'user13',
    content: 'Meeting postponed to 3pm',
    timestamp: new Date(Date.now() - 7200000),
    readBy: ['user14', 'user15'],
    deleted: true,
    deletedAt: new Date(Date.now() - 7000000)
  },
  'msg20': {
    id: 'msg20',
    chatRoomId: 'room10',
    senderId: 'user16',
    content: 'Thanks everyone for the help today!',
    timestamp: new Date(Date.now() - 3600000),
    readBy: ['user17', 'user18', 'user19'],
    reactions: { '❤️': ['user17', 'user18'], '👍': ['user19'] }
  },

  // More diverse messages
  'msg21': {
    id: 'msg21',
    chatRoomId: 'room11',
    senderId: 'user2',
    content: 'Does anyone have recommendations for a good dentist?',
    timestamp: new Date(Date.now() - 1800000),
    readBy: ['user3', 'user4']
  },
  'msg22': {
    id: 'msg22',
    chatRoomId: 'room12',
    senderId: 'user5',
    mediaIds: ['media7', 'media8'],
    content: 'Vacation photos from Hawaii!',
    timestamp: new Date(Date.now() - 1200000),
    readBy: ['user6', 'user7', 'user8'],
    reactions: { '😍': ['user6', 'user7'], '🌴': ['user8'] }
  },
  'msg23': {
    id: 'msg23',
    chatRoomId: 'room13',
    senderId: 'user9',
    content: 'The package should arrive tomorrow',
    timestamp: new Date(Date.now() - 900000),
    readBy: ['user10']
  },
  'msg24': {
    id: 'msg24',
    chatRoomId: 'room14',
    senderId: 'user11',
    content: 'I think we should reconsider our strategy',
    timestamp: new Date(Date.now() - 600000),
    readBy: ['user12', 'user13'],
    replyToId: 'msg23'
  },
  'msg25': {
    id: 'msg25',
    chatRoomId: 'room15',
    senderId: 'user14',
    mediaIds: ['media9'],
    content: 'Look what just arrived!',
    timestamp: new Date(Date.now() - 300000),
    readBy: ['user15']
  },

  // Last few messages
  'msg26': {
    id: 'msg26',
    chatRoomId: 'room16',
    senderId: 'user17',
    content: 'Happy Friday everyone!',
    timestamp: new Date(Date.now() - 240000),
    readBy: ['user18', 'user19', 'user20'],
    reactions: { '🎉': ['user18', 'user19'] }
  },
  'msg27': {
    id: 'msg27',
    chatRoomId: 'room17',
    senderId: 'user1',
    content: 'Reminder: Team building event next week',
    timestamp: new Date(Date.now() - 180000),
    readBy: ['user2', 'user3']
  },
  'msg28': {
    id: 'msg28',
    chatRoomId: 'room18',
    senderId: 'user4',
    content: 'I\'ll be late to the meeting, stuck in traffic',
    timestamp: new Date(Date.now() - 120000),
    readBy: ['user5', 'user6']
  },
  'msg29': {
    id: 'msg29',
    chatRoomId: 'room19',
    senderId: 'user7',
    mediaIds: ['media10'],
    content: 'Documentation for the new API',
    timestamp: new Date(Date.now() - 60000),
    readBy: ['user8']
  },
  'msg30': {
    id: 'msg30',
    chatRoomId: 'room20',
    senderId: 'user10',
    content: 'Goodnight all! ✨',
    timestamp: new Date(Date.now() - 30000),
    readBy: ['user11', 'user12'],
    reactions: { '🌙': ['user11'] }
  }
};