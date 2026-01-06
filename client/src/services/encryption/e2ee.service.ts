import { encryptData, decryptData } from "./crypto.utils";
import { KeyManager } from "./key-manager.service";

export class E2EEService {
  private static instance: E2EEService;
  private keyManager = KeyManager.getInstance();

  static getInstance(): E2EEService {
    if (!E2EEService.instance) {
      E2EEService.instance = new E2EEService();
    }
    return E2EEService.instance;
  }

  // Setup chat encryption
  async setupChat(chatId: string): Promise<void> {
    await this.keyManager.generateChatKey(chatId);
  }

  // Encrypt text
  async encryptText(chatId: string, text: string): Promise<string> {
    const key = await this.keyManager.getChatKey(chatId);
    const encrypted = await encryptData(key, text);
    return JSON.stringify(encrypted);
  }

  // Decrypt text
  async decryptText(chatId: string, encryptedString: string): Promise<string> {
    const key = await this.keyManager.getChatKey(chatId);
    const encrypted = JSON.parse(encryptedString);
    return await decryptData(key, encrypted);
  }

  // Encrypt JSON object
  async encryptJson(chatId: string, data: unknown): Promise<string> {
    const jsonString = JSON.stringify(data);
    return await this.encryptText(chatId, jsonString);
  }

  // Decrypt JSON object
  async decryptJson<T>(chatId: string, encryptedString: string): Promise<T> {
    const decrypted = await this.decryptText(chatId, encryptedString);
    return JSON.parse(decrypted);
  }
}
