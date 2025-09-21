// services/audio.service.ts
import notificationSound from "@/assets/sound/bell2.mp3";
import ringSound from "@/assets/sound/click.mp3";
import dialSound from "@/assets/sound/telephone-dialing-2.mp3";
import activeSound from "@/assets/sound/active.mp3";
import endCallSound from "@/assets/sound/end-call.mp3";
import reactionSound from "@/assets/sound/message-bubble.mp3";
import messageSound from "@/assets/sound/message-bubble.mp3";
import slidingSound from "@/assets/sound/click.mp3";
import typingSound from "@/assets/sound/message-sent.mp3";
import errorSound from "@/assets/sound/error2.mp3";
import { handleError } from "@/utils/handleError";

// Define the SoundType as an enum
export enum SoundType {
  NOTIFICATION = "notification",
  INCOMING_CALL = "call-incoming",
  OUTGOING_CALL = "call-outgoing",
  CALL_CONNECTED = "call-connected",
  CALL_END = "call-end",
  NEW_MESSAGE = "new-message",
  REACTION = "reaction",

  SLIDE = "slide",
  TYPING = "typing",

  ERROR = "error",
}

export interface AudioService {
  playSound: (type: SoundType) => Promise<void>;
  stopSound: (type: SoundType) => void;
  stopAllSounds: () => void; // Add this to interface
  setVolume: (volume: number) => void;
  getVolume: () => number;
  preloadSounds: () => Promise<void>;
  muteAll: () => void;
  unmuteAll: () => void;
}

class AudioServiceImpl implements AudioService {
  private sounds: Map<SoundType, HTMLAudioElement> = new Map();
  private volume = 0.7;
  private isMuted = false;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds() {
    const soundConfig: Record<SoundType, string> = {
      [SoundType.NOTIFICATION]: notificationSound,
      [SoundType.INCOMING_CALL]: ringSound,
      [SoundType.OUTGOING_CALL]: dialSound,
      [SoundType.CALL_CONNECTED]: activeSound,
      [SoundType.CALL_END]: endCallSound,
      [SoundType.NEW_MESSAGE]: messageSound,
      [SoundType.REACTION]: reactionSound,
      [SoundType.SLIDE]: slidingSound,
      [SoundType.TYPING]: typingSound,
      [SoundType.ERROR]: errorSound,
    };

    Object.entries(soundConfig).forEach(([type, src]) => {
      const audio = new Audio();
      audio.src = src;
      audio.preload = "auto";
      audio.volume = this.volume;
      this.sounds.set(type as SoundType, audio);
    });
  }

  async playSound(type: SoundType): Promise<void> {
    if (this.isMuted) return;

    const sound = this.sounds.get(type);
    if (!sound) {
      console.warn(`Sound ${type} not found`);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 50));
      sound.currentTime = 0;
      await sound.play();
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
        // expected if another play() interrupted
        return;
      }
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        // User hasn’t interacted → just skip
        // console.log("Skipping sound: no user interaction yet");
        return;
      }
      handleError(error, "Failed to play sound");
    }
  }

  stopSound(type: SoundType): void {
    const sound = this.sounds.get(type);
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }

  stopAllSounds(): void {
    // CORRECTED: Pass the SoundType to stopSound
    this.sounds.forEach((_sound, type) => {
      this.stopSound(type);
    });
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach((sound) => {
      sound.volume = this.volume;
    });
  }

  getVolume(): number {
    return this.volume;
  }

  async preloadSounds(): Promise<void> {
    // Preload all sounds
    const preloadPromises = Array.from(this.sounds.values()).map((sound) => {
      return new Promise<void>((resolve) => {
        sound.addEventListener("canplaythrough", () => resolve(), {
          once: true,
        });
        sound.load();
      });
    });

    await Promise.all(preloadPromises);
  }

  // Optional: Mute all sounds
  muteAll(): void {
    this.isMuted = true;
    this.sounds.forEach((sound) => sound.pause());
  }

  unmuteAll(): void {
    this.isMuted = false;
  }
}

// Singleton instance
export const audioService = new AudioServiceImpl();
