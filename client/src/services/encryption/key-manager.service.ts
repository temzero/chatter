import { generateKey, exportKey, importKey } from "./crypto.utils";

export class KeyManager {
  private static instance: KeyManager;
  private chatKeys = new Map<string, CryptoKey>();

  static getInstance(): KeyManager {
    if (!KeyManager.instance) {
      KeyManager.instance = new KeyManager();
    }
    return KeyManager.instance;
  }

  // Generate and store a key for a chat
  async generateChatKey(chatId: string): Promise<void> {
    const key = await generateKey();
    this.chatKeys.set(chatId, key);
    await this.saveKey(chatId, key);
  }

  // Get key for a chat
  async getChatKey(chatId: string): Promise<CryptoKey> {
    // Try memory first
    let key = this.chatKeys.get(chatId);
    if (key) return key;

    // Try localStorage
    key = (await this.loadKey(chatId)) ?? undefined;
    if (key) {
      this.chatKeys.set(chatId, key);
      return key;
    }

    throw new Error(`No encryption key for chat ${chatId}`);
  }

  // Save key to localStorage
  private async saveKey(chatId: string, key: CryptoKey): Promise<void> {
    const keyString = await exportKey(key);
    localStorage.setItem(`chat_key_${chatId}`, keyString);
  }

  // Load key from localStorage
  private async loadKey(chatId: string): Promise<CryptoKey | null> {
    const keyString = localStorage.getItem(`chat_key_${chatId}`);
    if (!keyString) return null;

    try {
      return await importKey(keyString);
    } catch {
      return null;
    }
  }

  // Remove key
  async removeChatKey(chatId: string): Promise<void> {
    this.chatKeys.delete(chatId);
    localStorage.removeItem(`chat_key_${chatId}`);
  }

  // Check if chat has key
  async hasChatKey(chatId: string): Promise<boolean> {
    return (
      this.chatKeys.has(chatId) ||
      localStorage.getItem(`chat_key_${chatId}`) !== null
    );
  }
}
