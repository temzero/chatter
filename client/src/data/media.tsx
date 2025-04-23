import image1 from '@/assets/image/image1.jpg';
import image2 from '@/assets/image/image2.jpg';
import image3 from '@/assets/image/image3.jpg';
import image4 from '@/assets/image/image4.jpg';
import image5 from '@/assets/image/image5.jpg';
import image6 from '@/assets/image/image6.jpg';
import image7 from '@/assets/image/image7.jpg';
import image8 from '@/assets/image/image8.jpg';
import image9 from '@/assets/image/image9.jpg';

export interface MediaProps {
    id: string;  // Change to string
    type: 'photo' | 'video' | 'audio' | 'file';
    url: string;
    messageId: string;  // Now using the message id directly as string
    fileName?: string; // For files and audio
    size?: number; // For files
    duration?: number; // For audio/video
}

export const mediaData: MediaProps[] = [
    // Alice (chatId: 1)
    {
        id: '1', // Change to string
        messageId: '100', // Change to string
        type: 'photo',
        url: image1,
    },
    {
        id: '2',
        messageId: '101',
        type: 'photo',
        url: image2,
    },
    {
        id: '3',
        messageId: '1001',
        type: 'photo',
        url: image2,
    },
    {
        id: '4',
        messageId: '1001',
        type: 'photo',
        url: image3,
    },
    {
        id: '5',
        messageId: '1001',
        type: 'photo',
        url: image4,
    },

    // Bob (chatId: 2)
    {
        id: '6',
        messageId: '102',
        type: 'file',
        url: '/files/document.pdf',
        fileName: 'document.pdf',
    },

    // Charlie (chatId: 3)
    {
        id: '7',
        messageId: '103',
        type: 'photo',
        url: image3,
    },

    // Diana (chatId: 4)
    {
        id: '8',
        messageId: '104',
        type: 'video',
        url: '/videos/demo.mp4',
    },

    // Eve (chatId: 5)
    {
        id: '9',
        messageId: '16',
        type: 'photo',
        url: image4,
    },

    // Frank (chatId: 6)
    {
        id: '10',
        messageId: '19',
        type: 'photo',
        url: image5,
    },

    // React Enthusiasts group (chatId: 21)
    {
        id: '11',
        messageId: '105',
        type: 'photo',
        url: image6,
    },
    {
        id: '12',
        messageId: '106',
        type: 'file',
        url: '/files/hook-example.js',
        fileName: 'hook-example.js',
    },

    // Work Team group (chatId: 22)
    {
        id: '13',
        messageId: '107',
        type: 'file',
        url: '/files/report-q3.pdf',
        fileName: 'report-q3.pdf',
    },

    // Weekend Warriors group (chatId: 23)
    {
        id: '14',
        messageId: '108',
        type: 'photo',
        url: image7,
    },
    {
        id: '15',
        messageId: '109',
        type: 'photo',
        url: image8,
    },

    // Study Group CS101 (chatId: 24)
    {
        id: '16',
        messageId: '34',
        type: 'file',
        url: '/files/notes.pdf',
        fileName: 'notes.pdf',
    },

    // Project Alpha group (chatId: 25)
    {
        id: '17',
        messageId: '39',
        type: 'photo',
        url: image9,
    },

    // Dev Channel (chatId: 26)
    {
        id: '18',
        messageId: '45',
        type: 'file',
        url: '/files/changelog.md',
        fileName: 'changelog.md',
    }
];

// Helper function to get media by messageId
export function getAllMediaByMessageId(messageId: string): MediaProps[] { // Change parameter type to string
    return mediaData.filter(media => media.messageId === messageId);
}

// In your media.ts file
import { MessagesData } from './message';

export function getMediaByChatId(chatId: string): MediaProps[] { // Change parameter type to string
  const chatMessages = MessagesData.filter(msg => msg.chatId === chatId);

  const mediaItems = chatMessages
    .filter(msg => msg.media)  // Only messages with media
    .map(msg => ({
      ...msg.media,  // Spread the media object
      messageId: msg.id,  // Include message ID for reference
      timestamp: msg.time  // Include message timestamp
    }));

  return mediaItems;
}
