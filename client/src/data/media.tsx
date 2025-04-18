// import image1 from '@/assets/image/image1.jpg';
// import image2 from '@/assets/image/image2.jpg';
// import image3 from '@/assets/image/image3.jpg';
// import image4 from '@/assets/image/image4.jpg';
// import image5 from '@/assets/image/image5.jpg';
// import image6 from '@/assets/image/image6.jpg';
// import image7 from '@/assets/image/image7.jpg';
// import image8 from '@/assets/image/image8.jpg';
// import image9 from '@/assets/image/image9.jpg';
import { MediaProps } from './types';

export const mediaData: Record<string, MediaProps> = {
  'media1': {
    id: 'media1',
    type: 'image',
    url: 'https://example.com/image1.jpg',
    thumbnail: 'https://example.com/thumb1.jpg',
    fileName: 'photo.jpg',
    fileSize: 1024,
    width: 800,
    height: 600,
    mimeType: 'image/jpeg',
    uploadedAt: new Date(),
    uploadedBy: 'user1'
  },
  'media2': {
    id: 'media2',
    type: 'video',
    url: 'https://example.com/video1.mp4',
    thumbnail: 'https://example.com/video-thumb1.jpg',
    duration: 120,
    fileSize: 102400,
    width: 1280,
    height: 720,
    mimeType: 'video/mp4',
    uploadedAt: new Date(Date.now() - 86400000),
    uploadedBy: 'user2'
  },
  'media3': {
    id: 'media3',
    type: 'audio',
    url: 'https://example.com/audio1.mp3',
    fileName: 'song.mp3',
    fileSize: 5120,
    duration: 210,
    mimeType: 'audio/mpeg',
    uploadedAt: new Date(Date.now() - 72000000),
    uploadedBy: 'user3'
  },
  'media4': {
    id: 'media4',
    type: 'image',
    url: 'https://example.com/image2.jpg',
    fileName: 'holiday.png',
    fileSize: 2048,
    width: 1024,
    height: 768,
    mimeType: 'image/png',
    uploadedAt: new Date(Date.now() - 43200000),
    uploadedBy: 'user4'
  },
  'media5': {
    id: 'media5',
    type: 'file',
    url: 'https://example.com/doc1.pdf',
    fileName: 'report.pdf',
    fileSize: 3072,
    mimeType: 'application/pdf',
    uploadedAt: new Date(Date.now() - 60000000),
    uploadedBy: 'user5'
  },
  'media6': {
    id: 'media6',
    type: 'image',
    url: 'https://example.com/image3.jpg',
    fileName: 'mountain.jpg',
    fileSize: 1500,
    width: 1920,
    height: 1080,
    mimeType: 'image/jpeg',
    uploadedAt: new Date(Date.now() - 10000000),
    uploadedBy: 'user6'
  },
  'media7': {
    id: 'media7',
    type: 'video',
    url: 'https://example.com/video2.mp4',
    thumbnail: 'https://example.com/video-thumb2.jpg',
    duration: 300,
    fileSize: 204800,
    width: 1920,
    height: 1080,
    mimeType: 'video/mp4',
    uploadedAt: new Date(Date.now() - 50000000),
    uploadedBy: 'user7'
  },
  'media8': {
    id: 'media8',
    type: 'file',
    url: 'https://example.com/spreadsheet.xlsx',
    fileName: 'budget.xlsx',
    fileSize: 1024,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    uploadedAt: new Date(Date.now() - 30000000),
    uploadedBy: 'user8'
  },
  'media9': {
    id: 'media9',
    type: 'audio',
    url: 'https://example.com/audio2.wav',
    fileName: 'podcast.wav',
    fileSize: 8192,
    duration: 1800,
    mimeType: 'audio/wav',
    uploadedAt: new Date(Date.now() - 25000000),
    uploadedBy: 'user9'
  },
  'media10': {
    id: 'media10',
    type: 'image',
    url: 'https://example.com/image4.jpg',
    fileName: 'selfie.jpg',
    fileSize: 1100,
    width: 720,
    height: 720,
    mimeType: 'image/jpeg',
    uploadedAt: new Date(Date.now() - 15000000),
    uploadedBy: 'user10'
  }
};
