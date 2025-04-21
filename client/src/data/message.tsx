import { createMessagesIndex } from '@/utils/messageUtils';
import { MediaProps, getMediaByMessageId } from './media';

export interface MessageProps {
    id: number;
    chatId: number;
    senderId?: string;
    time: string;
    text?: string;
    media?: MediaProps;
}

export const MessagesData: MessageProps[] = [
    // Alice (id: 1)
    {
        id: 1,
        chatId: 1,
        senderId: 'Alice',
        text: 'Hi',
        time: '10:40 AM',
    },
    {
        id: 99,
        chatId: 1,
        senderId: 'Alice',
        text: 'Hey there! How are you doing?',
        time: '10:40 AM',
    },
    {
        id: 2,
        chatId: 1,
        senderId: 'Me',
        text: "I'm good, thanks! How about you? I'm good, thanks! How about you? I'm good, thanks! How about you? I'm good, thanks! How about you? I'm good, thanks! How about you?",
        time: '10:42 AM',
    },
    {
        id: 3,
        chatId: 1,
        senderId: 'Alice',
        text: 'Pretty good! Just working on some React components.',
        time: '10:45 AM',
    },
    {
        id: 4,
        chatId: 1,
        senderId: 'Me',
        text: 'Nice! Need any help with that?',
        time: '10:47 AM',
    },
    {
        id: 100,
        chatId: 1,
        senderId: 'Alice',
        text: 'Check out this UI I designed!',
        time: '10:50 AM',
        media: getMediaByMessageId(100)
    },
    {
        id: 1001,
        chatId: 1,
        senderId: 'Alice',
        time: '10:50 AM',
        media: getMediaByMessageId(1001)
    },
    {
        id: 101,
        chatId: 1,
        senderId: 'Me',
        text: 'Looks great! Here\'s my version',
        time: '10:52 AM',
        media: getMediaByMessageId(101)
    },

    // Bob (id: 2)
    {
        id: 5,
        chatId: 2,
        senderId: 'Bob',
        text: 'Hi, just checking in on the project status',
        time: '9:15 AM',
    },
    {
        id: 6,
        chatId: 2,
        senderId: 'Me',
        text: "We're about 80% done. Should finish by Friday.",
        time: '9:18 AM',
    },
    {
        id: 7,
        chatId: 2,
        senderId: 'Bob',
        text: 'Great! See you later at the standup.',
        time: '9:20 AM',
    },
    {
        id: 102,
        chatId: 2,
        senderId: 'Bob',
        text: 'Here\'s the project document for review Here\'s the project document for review Here\'s the project document for review',
        time: '9:25 AM',
        media: getMediaByMessageId(102)
    },

    // Charlie (id: 3)
    {
        id: 8,
        chatId: 3,
        senderId: 'Charlie',
        text: 'Hey, are you free tomorrow afternoon?',
        time: '8:10 AM',
    },
    {
        id: 9,
        chatId: 3,
        senderId: 'Me',
        text: 'Yes, after 2pm. What do you have in mind?',
        time: '8:12 AM',
    },
    {
        id: 10,
        chatId: 3,
        senderId: 'Charlie',
        text: 'Let\'s meet up tomorrow at the library to work on the assignment.',
        time: '8:15 AM',
    },
    {
        id: 103,
        chatId: 3,
        senderId: 'Charlie',
        text: 'This is the book we should reference',
        time: '8:20 AM',
        media: getMediaByMessageId(103)
    },

    // Diana (id: 4)
    {
        id: 11,
        chatId: 4,
        senderId: 'Diana',
        text: 'Did you see the new design mockups I sent?',
        time: '7:00 AM',
    },
    {
        id: 12,
        chatId: 4,
        senderId: 'Me',
        text: 'Yes, they look amazing! Love the new color scheme.',
        time: '7:03 AM',
    },
    {
        id: 13,
        chatId: 4,
        senderId: 'Diana',
        text: 'Got it, thanks for the feedback!',
        time: '7:05 AM',
    },
    {
        id: 104,
        chatId: 4,
        senderId: 'Diana',
        text: 'Heres a quick demo of the animations Heres a quick demo of the animations Heres a quick demo of the animations',
        time: '7:10 AM',
        media: getMediaByMessageId(104)
    },

    // Eve (id: 5)
    {
        id: 14,
        chatId: 5,
        senderId: 'Eve',
        text: 'Morning! Did you finish the project documentation?',
        time: 'Yesterday, 4:30 PM',
    },
    {
        id: 15,
        chatId: 5,
        senderId: 'Me',
        text: 'Almost done, just need to review the last section.',
        time: 'Yesterday, 4:45 PM',
    },
    {
        id: 16,
        chatId: 5,
        senderId: 'Eve',
        text: 'Perfect. Here\'s the reference material I used',
        time: 'Yesterday, 5:00 PM',
        media: getMediaByMessageId(16)
    },

    // Frank (id: 6)
    {
        id: 17,
        chatId: 6,
        senderId: 'Frank',
        text: 'Hey buddy! Long time no see.',
        time: 'Yesterday, 3:20 PM',
    },
    {
        id: 18,
        chatId: 6,
        senderId: 'Me',
        text: 'I know! We should catch up soon.',
        time: 'Yesterday, 3:25 PM',
    },
    {
        id: 19,
        chatId: 6,
        senderId: 'Frank',
        text: 'Let\'s grab coffee later this week. Here\'s a photo from last time!',
        time: 'Yesterday, 3:30 PM',
        media: getMediaByMessageId(19)
    },

    // React Enthusiasts group (id: 21)
    {
        id: 20,
        chatId: 21,
        senderId: 'Alice',
        text: 'Has anyone tried the new React 18 features?',
        time: '11:20 AM',
    },
    {
        id: 21,
        chatId: 21,
        senderId: 'Jack',
        text: 'Yes! The concurrent rendering is game-changing.',
        time: '11:25 AM',
    },
    {
        id: 22,
        chatId: 21,
        senderId: 'Alice',
        text: 'Check out this new hook I created for form validation!',
        time: '11:30 AM',
    },
    {
        id: 23,
        chatId: 21,
        senderId: 'Me',
        text: 'That looks really useful. Can you share the code?',
        time: '11:32 AM',
    },
    {
        id: 105,
        chatId: 21,
        senderId: 'Alice',
        text: 'Here\'s a screenshot of the implementation',
        time: '11:35 AM',
        media: getMediaByMessageId(105)
    },
    {
        id: 106,
        chatId: 21,
        senderId: 'Jack',
        text: 'Here\'s my version of that hook',
        time: '11:40 AM',
        media: getMediaByMessageId(106)
    },

    // Work Team group (id: 22)
    {
        id: 24,
        chatId: 22,
        senderId: 'Grace',
        text: 'Reminder: Quarterly reports are due by EOD',
        time: '10:00 AM',
    },
    {
        id: 25,
        chatId: 22,
        senderId: 'Tom',
        text: 'Meeting at 3pm in Conference Room B',
        time: '10:15 AM',
    },
    {
        id: 26,
        chatId: 22,
        senderId: 'Me',
        text: 'I\'ll be there. Should I bring the presentation?',
        time: '10:20 AM',
    },
    {
        id: 27,
        chatId: 22,
        senderId: 'Tom',
        text: 'Yes please, and the Q3 projections too.',
        time: '10:22 AM',
    },
    {
        id: 107,
        chatId: 22,
        senderId: 'Grace',
        text: 'Attached is the report template',
        time: '10:25 AM',
        media: getMediaByMessageId(107)
    },

    // Weekend Warriors group (id: 23)
    {
        id: 28,
        chatId: 23,
        senderId: 'Frank',
        text: 'Who\'s up for hiking this Saturday?',
        time: 'Yesterday, 2:00 PM',
    },
    {
        id: 29,
        chatId: 23,
        senderId: 'Diana',
        text: 'I\'m in! What time were you thinking?',
        time: 'Yesterday, 2:15 PM',
    },
    {
        id: 30,
        chatId: 23,
        senderId: 'Me',
        text: 'Count me in too. Morning hike?',
        time: 'Yesterday, 2:20 PM',
    },
    {
        id: 31,
        chatId: 23,
        senderId: 'Frank',
        text: 'How about we meet at the trailhead at 8am?',
        time: 'Yesterday, 2:30 PM',
    },
    {
        id: 108,
        chatId: 23,
        senderId: 'Frank',
        text: 'This is the trail I was thinking of',
        time: 'Yesterday, 2:40 PM',
        media: getMediaByMessageId(108)
    },
    {
        id: 109,
        chatId: 23,
        senderId: 'Diana',
        text: 'Looks perfect! Here\'s a photo from last time',
        time: 'Yesterday, 2:45 PM',
        media: getMediaByMessageId(109)
    },

    // Study Group CS101 (id: 24)
    {
        id: 32,
        chatId: 24,
        senderId: 'Henry',
        text: 'Does anyone understand question 3 on the homework?',
        time: 'Monday, 6:00 PM',
    },
    {
        id: 33,
        chatId: 24,
        senderId: 'Olivia',
        text: 'I think it\'s about recursion. Let me check my notes.',
        time: 'Monday, 6:15 PM',
    },
    {
        id: 34,
        chatId: 24,
        senderId: 'Henry',
        text: 'I shared the notes in the drive',
        time: 'Monday, 6:30 PM',
        media: getMediaByMessageId(34)
    },
    {
        id: 35,
        chatId: 24,
        senderId: 'Me',
        text: 'Thanks Henry! That helps a lot.',
        time: 'Monday, 6:35 PM',
    },

    // Project Alpha group (id: 25)
    {
        id: 36,
        chatId: 25,
        senderId: 'Grace',
        text: 'The staging environment is ready for testing',
        time: 'Sunday, 10:00 AM',
    },
    {
        id: 37,
        chatId: 25,
        senderId: 'Jack',
        text: 'I\'ve pushed the latest changes. QA can start now.',
        time: 'Sunday, 11:30 AM',
    },
    {
        id: 38,
        chatId: 25,
        senderId: 'Grace',
        text: 'Deployment completed successfully',
        time: 'Sunday, 1:45 PM',
    },
    {
        id: 39,
        chatId: 25,
        senderId: 'Me',
        text: 'Great work everyone! Heres our progress so far',
        time: 'Sunday, 2:00 PM',
        media: getMediaByMessageId(39)
    },

    // Dev Channel (id: 26)
    {
        id: 40,
        chatId: 26,
        text: 'New deployment is live! 🚀',
        time: 'Today, 9:00 AM',
    },
    {
        id: 41,
        chatId: 26,   
        text: 'Nice! Ill verify the staging behavior now.',
        time: 'Today, 9:05 AM',
    },
    {
        id: 42,
        chatId: 26,   
        text: 'Heads up: theres a small glitch on the login screen in mobile view.',
        time: 'Today, 9:10 AM',
        media: getMediaByMessageId(100)
    },
    {
        id: 43,
        chatId: 26,
        text: 'Got it. Ill patch that right away.',
        time: 'Today, 9:12 AM',
    },
    {
        id: 44,
        chatId: 26,    
        text: 'Can we also review the new caching strategy during standup?',
        time: 'Today, 9:15 AM',
    },
    {
        id: 45,
        chatId: 26,   
        text: 'Sure, here are the updated docs',
        time: 'Today, 9:17 AM',
        media: getMediaByMessageId(101)
    }
];

// Create the optimized index
export const MessagesIndex = createMessagesIndex(MessagesData);

// Helper function to get messages by chatId
export function getMessagesByChatId(chatId: number): MessageProps[] {
  return MessagesIndex.get(chatId) || [];
}