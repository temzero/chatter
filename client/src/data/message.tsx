import { createMessagesIndex } from '@/utils/messageUtils';
import { MediaProps, getAllMediaByMessageId } from './media';

export interface MessageProps {
  id: string;
  chatId: string;
  senderId?: string;
  time: string;
  text?: string;
  media?: MediaProps[];
}

export const MessagesData: MessageProps[] = [
  // Alice (id: 1)
  {
    id: '1',
    chatId: '1',
    senderId: 'Alice',
    text: 'Hi',
    time: '2025-04-26T10:40:00.000Z',
  },
  {
    id: '99',
    chatId: '1',
    senderId: 'Alice',
    text: 'Hey there! How are you doing?',
    time: '2025-04-26T10:40:00.000Z',
  },
  {
    id: '2',
    chatId: '1',
    senderId: 'Me',
    text: "I'm good, thanks! How about you? I'm good, thanks! How about you? I'm good, thanks! How about you? I'm good, thanks! How about you? I'm good, thanks! How about you?",
    time: '2025-04-26T10:42:00.000Z',
  },
  {
    id: '3',
    chatId: '1',
    senderId: 'Alice',
    text: 'Pretty good! Just working on some React components.',
    time: '2025-04-26T10:45:00.000Z',
  },
  {
    id: '4',
    chatId: '1',
    senderId: 'Me',
    text: 'Nice! Need any help with that?',
    time: '2025-04-26T10:47:00.000Z',
  },
  {
    id: '100',
    chatId: '1',
    senderId: 'Alice',
    text: 'Check out this UI I designed!',
    time: '2025-04-26T10:50:00.000Z',
    media: getAllMediaByMessageId('100'),
  },
  {
    id: '1001',
    chatId: '1',
    senderId: 'Alice',
    time: '2025-04-26T10:50:00.000Z',
    text: 'Look at these images Looks great! Here\'s my version, it is very good in deed, i\'ve spend the whole night for that!',
    media: getAllMediaByMessageId('1001'),
  },
  {
    id: '101',
    chatId: '1',
    senderId: 'Me',
    text: 'Looks great! Here\'s my version, it is very good in deed, i\'ve spend the whole night for that!',
    time: '2025-04-26T10:52:00.000Z',
    media: getAllMediaByMessageId('101'),
  },

  // Bob (id: 2)
  {
    id: '5',
    chatId: '2',
    senderId: 'Bob',
    text: 'Hi, just checking in on the project status',
    time: '2025-04-26T09:15:00.000Z',
  },
  {
    id: '6',
    chatId: '2',
    senderId: 'Me',
    text: "We're about 80% done. Should finish by Friday.",
    time: '2025-04-26T09:18:00.000Z',
  },
  {
    id: '7',
    chatId: '2',
    senderId: 'Bob',
    text: 'Great! See you later at the standup.',
    time: '2025-04-26T09:20:00.000Z',
  },
  {
    id: '102',
    chatId: '2',
    senderId: 'Bob',
    text: 'Here\'s the project document for review Here\'s the project document for review Here\'s the project document for review',
    time: '2025-04-26T09:25:00.000Z',
    media: getAllMediaByMessageId('102'),
  },

  // Charlie (id: 3)
  {
    id: '8',
    chatId: '3',
    senderId: 'Charlie',
    text: 'Hey, are you free tomorrow afternoon?',
    time: '2025-04-26T08:10:00.000Z',
  },
  {
    id: '9',
    chatId: '3',
    senderId: 'Me',
    text: 'Yes, after 2pm. What do you have in mind?',
    time: '2025-04-26T08:12:00.000Z',
  },
  {
    id: '10',
    chatId: '3',
    senderId: 'Charlie',
    text: 'Let\'s meet up tomorrow at the library to work on the assignment.',
    time: '2025-04-26T08:15:00.000Z',
  },
  {
    id: '103',
    chatId: '3',
    senderId: 'Charlie',
    text: 'This is the book we should reference',
    time: '2025-04-26T08:20:00.000Z',
    media: getAllMediaByMessageId('103'),
  },

  // Diana (id: 4)
  {
    id: '11',
    chatId: '4',
    senderId: 'Diana',
    text: 'Did you see the new design mockups I sent?',
    time: '2025-04-26T07:00:00.000Z',
  },
  {
    id: '12',
    chatId: '4',
    senderId: 'Me',
    text: 'Yes, they look amazing! Love the new color scheme.',
    time: '2025-04-26T07:03:00.000Z',
  },
  {
    id: '13',
    chatId: '4',
    senderId: 'Diana',
    text: 'Got it, thanks for the feedback!',
    time: '2025-04-26T07:05:00.000Z',
  },
  {
    id: '104',
    chatId: '4',
    senderId: 'Diana',
    text: 'Heres a quick demo of the animations Heres a quick demo of the animations Heres a quick demo of the animations',
    time: '2025-04-26T07:10:00.000Z',
    media: getAllMediaByMessageId('104'),
  },

  // Eve (id: 5)
  {
    id: '14',
    chatId: '5',
    senderId: 'Eve',
    text: 'Morning! Did you finish the project documentation?',
    time: '2025-04-25T16:30:00.000Z', // Yesterday 4:30 PM
  },
  {
    id: '15',
    chatId: '5',
    senderId: 'Me',
    text: 'Almost done, just need to review the last section.',
    time: '2025-04-25T16:45:00.000Z', // Yesterday 4:45 PM
  },
  {
    id: '16',
    chatId: '5',
    senderId: 'Eve',
    text: 'Perfect. Here\'s the reference material I used',
    time: '2025-04-25T17:00:00.000Z', // Yesterday 5:00 PM
    media: getAllMediaByMessageId('16'),
  },

  // Frank (id: 6)
  {
    id: '17',
    chatId: '6',
    senderId: 'Frank',
    text: 'Hey buddy! Long time no see.',
    time: '2025-04-25T15:20:00.000Z', // Yesterday 3:20 PM
  },
  {
    id: '18',
    chatId: '6',
    senderId: 'Me',
    text: 'I know! We should catch up soon.',
    time: '2025-04-25T15:25:00.000Z', // Yesterday 3:25 PM
  },
  {
    id: '19',
    chatId: '6',
    senderId: 'Frank',
    text: 'Let\'s grab coffee later this week. Here\'s a image from last time!',
    time: '2025-04-25T15:30:00.000Z', // Yesterday 3:30 PM
    media: getAllMediaByMessageId('19'),
  },

  // React Enthusiasts group (id: 21)
  {
    id: '20',
    chatId: '21',
    senderId: 'Alice',
    text: 'Has anyone tried the new React 18 features?',
    time: '2025-04-26T11:20:00.000Z',
  },
  {
    id: '21',
    chatId: '21',
    senderId: 'Jack',
    text: 'Yes! The concurrent rendering is game-changing.',
    time: '2025-04-26T11:25:00.000Z',
  },
  {
    id: '22',
    chatId: '21',
    senderId: 'Alice',
    text: 'Check out this new hook I created for form validation!',
    time: '2025-04-26T11:30:00.000Z',
  },
  {
    id: '23',
    chatId: '21',
    senderId: 'Me',
    text: 'That looks really useful. Can you share the code?',
    time: '2025-04-26T11:32:00.000Z',
  },
  {
    id: '105',
    chatId: '21',
    senderId: 'Alice',
    text: 'Here\'s a screenshot of the implementation',
    time: '2025-04-26T11:35:00.000Z',
    media: getAllMediaByMessageId('105'),
  },
  {
    id: '106',
    chatId: '21',
    senderId: 'Jack',
    text: 'Here\'s my version of that hook',
    time: '2025-04-26T11:40:00.000Z',
    media: getAllMediaByMessageId('106'),
  },

  // Work Team group (id: 22)
  {
    id: '24',
    chatId: '22',
    senderId: 'Grace',
    text: 'Reminder: Quarterly reports are due by EOD',
    time: '2025-04-26T10:00:00.000Z',
  },
  {
    id: '25',
    chatId: '22',
    senderId: 'Tom',
    text: 'Meeting at 3pm in Conference Room B',
    time: '2025-04-26T15:00:00.000Z', // 3 PM
  },
  {
    id: '26',
    chatId: '22',
    senderId: 'Me',
    text: 'I\'ll be there. Should I bring the presentation?',
    time: '2025-04-26T10:20:00.000Z',
  },
  {
    id: '27',
    chatId: '22',
    senderId: 'Tom',
    text: 'Yes please, and the Q3 projections too.',
    time: '2025-04-26T10:25:00.000Z',
  },
  {
    id: '107',
    chatId: '22',
    senderId: 'Grace',
    text: 'Here\'s the updated report',
    time: '2025-04-26T10:30:00.000Z',
    media: getAllMediaByMessageId('107'),
  },
  {
    id: '26', // Duplicate ID - might be intentional, but worth noting
    chatId: '26', // Different chatId
    senderId: 'Me',
    text: 'I\'ll be there. Should I bring the presentation?',
    time: '2025-04-26T10:20:00.000Z',
  },
  {
    id: '27', // Duplicate ID
    chatId: '26', // Different chatId
    senderId: 'Tom',
    text: 'Yes please, and the Q3 projections too.',
    time: '2025-04-26T10:25:00.000Z',
  },
  {
    id: '107', // Duplicate ID
    chatId: '26', // Different chatId
    senderId: 'Grace',
    text: 'Here\'s the updated report',
    time: '2025-04-26T10:30:00.000Z',
    media: getAllMediaByMessageId('107'),
  },
];

// Create the optimized index
export const MessagesIndex = createMessagesIndex(MessagesData);

// Helper function to get messages by chatId
export function getMessagesByChatId(chatId: string): MessageProps[] {
  return MessagesIndex.get(chatId) || [];
}