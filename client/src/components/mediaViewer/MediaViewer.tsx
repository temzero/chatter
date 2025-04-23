import styles from './MediaViewer.module.css';
import { MediaProps } from '@/data/media';

interface MediaViewerProps {
  media: MediaProps;
  onClose: () => void;
}

export default function MediaViewer({ media, onClose }: MediaViewerProps) {
  if (!media) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={e => e.stopPropagation()}>
        {media.type === 'photo' ? (
          <img src={media.src} alt="Full view" />
        ) : (
          <video controls src={media.src} />
        )}
      </div>
    </div>
  );
}