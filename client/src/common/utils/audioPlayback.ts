// utils/audioPlayback.ts
export interface AudioPlaybackOptions {
  onTimeUpdate?: (currentTime: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError?: (error: any) => void;
  onLoadedMetadata?: (duration: number) => void;
}

export interface AudioPlaybackInstance {
  audio: HTMLAudioElement;
  objectURL: string;
  isPlaying: boolean;
  cleanup: () => void;
  pause: () => void;
  seek: (time: number) => void;
}

export class AudioPlaybackManager {
  private static instances: Map<string, AudioPlaybackInstance> = new Map();
  
  static play(
    audioBlob: Blob,
    options: AudioPlaybackOptions = {}
  ): AudioPlaybackInstance | null {
    try {
      // Clean up any existing instances
      this.cleanupAll();
      
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      
      const instance: AudioPlaybackInstance = {
        audio,
        objectURL: url,
        isPlaying: false,
        cleanup: () => {
          audio.pause();
          URL.revokeObjectURL(url);
          audio.remove();
          this.instances.delete(url);
        },
        pause: () => audio.pause(),
        seek: (time: number) => {
          if (time >= 0 && time <= audio.duration) {
            audio.currentTime = time;
          }
        }
      };
      
      // Set up event listeners
      audio.onloadedmetadata = () => {
        options.onLoadedMetadata?.(audio.duration);
      };
      
      audio.onplay = () => {
        instance.isPlaying = true;
        options.onPlay?.();
      };
      
      audio.onpause = () => {
        instance.isPlaying = false;
        options.onPause?.();
      };
      
      audio.onended = () => {
        instance.isPlaying = false;
        options.onEnded?.();
      };
      
      audio.ontimeupdate = () => {
        options.onTimeUpdate?.(audio.currentTime);
      };
      
      audio.onerror = (error) => {
        console.error("Audio playback error:", error);
        options.onError?.(error);
        instance.cleanup();
      };
      
      // Store instance
      this.instances.set(url, instance);
      
      // Start playback
      audio.play().catch((error) => {
        console.error("Failed to play audio:", error);
        options.onError?.(error);
        instance.cleanup();
        return null;
      });
      
      return instance;
    } catch (error) {
      console.error("Error creating audio playback:", error);
      return null;
    }
  }
  
  static pauseAll() {
    this.instances.forEach(instance => instance.audio.pause());
  }
  
  static cleanupAll() {
    this.instances.forEach(instance => instance.cleanup());
    this.instances.clear();
  }
  
  static getCurrentInstance(): AudioPlaybackInstance | null {
    const instances = Array.from(this.instances.values());
    return instances.find(inst => inst.isPlaying) || instances[0] || null;
  }
}