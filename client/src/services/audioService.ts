// services/audioService.ts
import activeSound from "@/assets/sound/active.mp3";
import breakSound from "@/assets/sound/break.mp3";
import card1Sound from "@/assets/sound/card1.mp3";
import card2Sound from "@/assets/sound/card2.mp3";
import card3Sound from "@/assets/sound/card3.mp3";
import card4Sound from "@/assets/sound/card4.mp3";
import connectSound from "@/assets/sound/connect.mp3";
import dialSound from "@/assets/sound/telephone-dialing.mp3";
import disconnectSound from "@/assets/sound/disconnect.mp3";
import downloadSound from "@/assets/sound/download.mp3";
import endCallSound from "@/assets/sound/end-call.mp3";
import errorSound from "@/assets/sound/error.mp3";
import messageSound from "@/assets/sound/message-bubble.mp3";
import notificationSound from "@/assets/sound/bell.mp3";
import pageSound from "@/assets/sound/paper.mp3";
import pop1Sound from "@/assets/sound/pop1.mp3";
import pop2Sound from "@/assets/sound/pop2.mp3";
import pinSound from "@/assets/sound/pin.mp3";
import reactionSound from "@/assets/sound/reaction.mp3";
import reactionRemoveSound from "@/assets/sound/reaction-remove.mp3";
import ringSound from "@/assets/sound/old-telephone-ringing.mp3";
import messageRemoveSound from "@/assets/sound/remove-message2.mp3";
import typingSound from "@/assets/sound/typing.mp3";
import logoutSound from "@/assets/sound/logout.mp3";

// Define the SoundType as an enum
export enum SoundType {
  NOTIFICATION = "notification",
  INCOMING_CALL = "call-incoming",
  OUTGOING_CALL = "call-outgoing",
  CALL_CONNECTED = "call-connected",
  CALL_END = "call-end",
  DOWNLOAD = "download",
  USER_CONNECTED = "user-connected",
  USER_DISCONNECTED = "user-disconnected",
  NEW_MESSAGE = "new-message",
  REACTION = "reaction",
  REACTION_REMOVE = "reaction-remove",
  MESSAGE_REMOVE = "message-remove",
  CARD1 = "card1",
  CARD2 = "card2",
  CARD3 = "card3",
  CARD4 = "card4",
  PAGE = "page",
  POP1 = "pop1",
  POP2 = "pop2",
  PIN = "pin",
  TYPING = "typing",
  BREAK = "break",
  ERROR = "error",
  LOGOUT = "logout",
}

export interface AudioService {
  playSound: (type: SoundType, volume?: number) => Promise<void>;
  playRandomSound: (types: SoundType[], volume?: number) => Promise<void>;
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
  private volume = 0.75;
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
      [SoundType.DOWNLOAD]: downloadSound,
      [SoundType.USER_CONNECTED]: connectSound,
      [SoundType.USER_DISCONNECTED]: disconnectSound,
      [SoundType.NEW_MESSAGE]: messageSound,
      [SoundType.REACTION]: reactionSound,
      [SoundType.REACTION_REMOVE]: reactionRemoveSound,
      [SoundType.MESSAGE_REMOVE]: messageRemoveSound,
      [SoundType.CARD1]: card1Sound,
      [SoundType.CARD2]: card2Sound,
      [SoundType.CARD3]: card3Sound,
      [SoundType.CARD4]: card4Sound,
      [SoundType.PAGE]: pageSound,
      [SoundType.POP1]: pop1Sound,
      [SoundType.POP2]: pop2Sound,
      [SoundType.PIN]: pinSound,
      [SoundType.TYPING]: typingSound,
      [SoundType.BREAK]: breakSound,
      [SoundType.ERROR]: errorSound,
      [SoundType.LOGOUT]: logoutSound,
    };

    Object.entries(soundConfig).forEach(([type, src]) => {
      const audio = new Audio();
      audio.src = src;
      audio.preload = "auto";
      audio.volume = this.volume;
      this.sounds.set(type as SoundType, audio);
    });
  }

  async playSound(type: SoundType, volume?: number): Promise<void> {
    if (this.isMuted) return;

    const sound = this.sounds.get(type);
    if (!sound) return;

    await new Promise((resolve) => setTimeout(resolve, 50));
    sound.currentTime = 0;

    sound.volume = volume !== undefined ? volume : this.volume;
    await sound.play();
  }

  async playRandomSound(types: SoundType[], volume?: number): Promise<void> {
    if (!types || types.length === 0) return;
    const randomIndex = Math.floor(Math.random() * types.length);
    const randomType = types[randomIndex];
    await this.playSound(randomType, volume);
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
