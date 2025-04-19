getUserChatRooms('user1');
// Returns:
[
  {
    id: 'room1',
    type: 'private',
    members: ['user1', 'user2'],
    createdAt: Date('2023-05-01T00:00:00Z'),
    createdBy: 'user1',
    lastMessage: 'msg3'
  },
  {
    id: 'room2',
    name: 'Team Chat',
    type: 'group',
    members: ['user1', 'user3'],
    admins: ['user1'],
    createdAt: Date('2023-05-05T00:00:00Z'),
    createdBy: 'user1',
    lastMessage: 'msg4'
  }
]

getChatRoomMessages('room1');
// Returns:
[
  {
    id: 'msg1',
    chatRoomId: 'room1',
    senderId: 'user1',
    content: 'Hey there!',
    timestamp: Date('2023-05-10T09:00:00Z')
  },
  {
    id: 'msg2',
    chatRoomId: 'room1',
    senderId: 'user2',
    content: 'Hi John! How are you?',
    timestamp: Date('2023-05-10T09:05:00Z')
  },
  {
    id: 'msg3',
    chatRoomId: 'room1',
    senderId: 'user1',
    mediaIds: ['media1'],
    timestamp: Date('2023-05-10T09:10:00Z')
  }
]

getMessageMedia('msg3');
// Returns:
[
  {
    id: 'media1',
    type: 'image',
    url: 'https://example.com/media/photo1.jpg',
    uploadedAt: Date('2023-05-10T08:30:00Z'),
    uploadedBy: 'user1'
  }
]

getUserMessages('user1');
// Returns:
[
  {
    id: 'msg1',
    chatRoomId: 'room1',
    senderId: 'user1',
    content: 'Hey there!',
    timestamp: Date('2023-05-10T09:00:00Z')
  },
  {
    id: 'msg3',
    chatRoomId: 'room1',
    senderId: 'user1',
    mediaIds: ['media1'],
    timestamp: Date('2023-05-10T09:10:00Z')
  }
]

getUser('user2');
// Returns:
{
  id: 'user2',
  username: 'janedoe',
  firstName: 'Jane',
  lastName: 'Doe',
  isOnline: false,
  lastSeen: Date('2023-05-15T10:00:00Z')
}

getChatRoomUsers('room1');
// Returns:
[
  {
    id: 'user1',
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    isOnline: true,
    avatar: 'https://example.com/avatars/john.jpg'
  },
  {
    id: 'user2',
    username: 'janedoe',
    firstName: 'Jane',
    lastName: 'Doe',
    isOnline: false,
    lastSeen: Date('2023-05-15T10:00:00Z')
  }
]

getLastMessage('room1');
// Returns:
{
  id: 'msg3',
  chatRoomId: 'room1',
  senderId: 'user1',
  mediaIds: ['media1'],
  timestamp: Date('2023-05-10T09:10:00Z')
}

getUserContacts('user1');
// Returns:
[
  {
    id: 'user2',
    username: 'janedoe',
    firstName: 'Jane',
    lastName: 'Doe',
    isOnline: false,
    lastSeen: Date('2023-05-15T10:00:00Z')
  },
  {
    id: 'user3',
    username: 'bobsmith',
    firstName: 'Bob',
    lastName: 'Smith',
    isOnline: true
  }
]

searchUsers('doe');
// Returns:
[
  {
    id: 'user1',
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    isOnline: true,
    avatar: 'https://example.com/avatars/john.jpg'
  },
  {
    id: 'user2',
    username: 'janedoe',
    firstName: 'Jane',
    lastName: 'Doe',
    isOnline: false,
    lastSeen: Date('2023-05-15T10:00:00Z')
  }
]

searchMessages('meeting');
// Returns:
[
  {
    id: 'msg4',
    chatRoomId: 'room2',
    senderId: 'user3',
    content: 'Meeting at 3pm',
    timestamp: Date('2023-05-12T14:30:00Z')
  }
]