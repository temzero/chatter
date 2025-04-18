import { UserProps } from "./types";

export const usersData: Record<string, UserProps> = {
  'user1': {
    id: 'user1',
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'johndoe@email.com',
    phoneNumber: '+1234567890',
    avatar: 'https://example.com/avatar1.jpg',
    isOnline: true,
    status: 'Hey there! I am using Telegram'
  },
  'user2': {
    id: 'user2',
    username: 'alice_smith',
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alicesmith@email.com',
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000)
  },
  'user3': {
    id: 'user3',
    username: 'michael92',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@email.com',
    isOnline: true,
    avatar: 'https://example.com/avatar3.jpg',
    status: 'Available',
  },
  'user4': {
    id: 'user4',
    username: 'sarah_lee',
    firstName: 'Sarah',
    lastName: 'Lee',
    isOnline: false,
    lastSeen: new Date(Date.now() - 7200000),
    bio: 'Love coffee and books.',
  },
  'user5': {
    id: 'user5',
    username: 'danny_p',
    firstName: 'Daniel',
    lastName: 'Peterson',
    phoneNumber: '+1987654321',
    isOnline: true,
    status: 'Busy right now'
  },
  'user6': {
    id: 'user6',
    username: 'emma.green',
    firstName: 'Emma',
    lastName: 'Green',
    isOnline: false,
    lastSeen: new Date(Date.now() - 600000),
    avatar: 'https://example.com/avatar6.jpg',
    birthday: '1996-04-15'
  },
  'user7': {
    id: 'user7',
    username: 'lucasw',
    firstName: 'Lucas',
    lastName: 'White',
    isOnline: true,
    email: 'lucas.white@email.com'
  },
  'user8': {
    id: 'user8',
    username: 'rachel_k',
    firstName: 'Rachel',
    lastName: 'Kim',
    isOnline: false,
    lastSeen: new Date(Date.now() - 9000000),
    status: 'At the gym',
    birthday: '1994-11-02'
  },
  'user9': {
    id: 'user9',
    username: 'tom_hardy',
    firstName: 'Tom',
    lastName: 'Hardy',
    isOnline: true
  },
  'user10': {
    id: 'user10',
    username: 'julia.v',
    firstName: 'Julia',
    lastName: 'Vega',
    phoneNumber: '+1123456789',
    avatar: 'https://example.com/avatar10.jpg',
    isOnline: false,
    lastSeen: new Date(Date.now() - 300000)
  },
  'user11': {
    id: 'user11',
    username: 'kevinb',
    firstName: 'Kevin',
    lastName: 'Brown',
    isOnline: true,
    bio: 'Always learning new things.'
  },
  'user12': {
    id: 'user12',
    username: 'natalie.m',
    firstName: 'Natalie',
    lastName: 'Moore',
    isOnline: false,
    lastSeen: new Date(Date.now() - 15000000),
    birthday: '1992-07-20'
  },
  'user13': {
    id: 'user13',
    username: 'steve_jobs',
    firstName: 'Steve',
    lastName: 'Jobs',
    isOnline: true,
    status: 'Innovating.'
  },
  'user14': {
    id: 'user14',
    username: 'ellie_b',
    firstName: 'Ellie',
    lastName: 'Brown',
    isOnline: false,
    lastSeen: new Date(Date.now() - 86400000),
    bio: 'Nature lover.',
    birthday: '1990-12-01'
  },
  'user15': {
    id: 'user15',
    username: 'marky_mark',
    firstName: 'Mark',
    lastName: 'Walters',
    isOnline: true
  },
  'user16': {
    id: 'user16',
    username: 'bella.d',
    firstName: 'Bella',
    lastName: 'Davis',
    isOnline: false,
    lastSeen: new Date(Date.now() - 5400000)
  },
  'user17': {
    id: 'user17',
    username: 'harrypotts',
    firstName: 'Harry',
    lastName: 'Potts',
    isOnline: true,
    email: 'harry.potts@email.com',
    avatar: 'https://example.com/avatar17.jpg'
  },
  'user18': {
    id: 'user18',
    username: 'grace_h',
    firstName: 'Grace',
    lastName: 'Hopper',
    isOnline: false,
    lastSeen: new Date(Date.now() - 1200000),
    bio: 'Code like a queen.',
    birthday: '1991-06-09'
  },
  'user19': {
    id: 'user19',
    username: 'franklin_r',
    firstName: 'Franklin',
    lastName: 'Reed',
    isOnline: true
  },
  'user20': {
    id: 'user20',
    username: 'zoe.s',
    firstName: 'Zoe',
    lastName: 'Sanders',
    isOnline: false,
    lastSeen: new Date(Date.now() - 18000000),
    email: 'zoe.sanders@email.com'
  }
};
