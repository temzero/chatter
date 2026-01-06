export interface EncryptedPayload {
  data: string;
  iv: string;
}

// 1. ENCRYPT - This works
export async function encryptData(
  key: CryptoKey,
  text: string
): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoded
  );

  return {
    data: arrayToBase64(encrypted),
    iv: arrayToBase64(iv),
  };
}

// 2. DECRYPT - FIXED VERSION
export async function decryptData(
  key: CryptoKey,
  encrypted: EncryptedPayload
): Promise<string> {
  // Convert to ArrayBuffer first
  const dataBuffer = base64ToArrayBuffer(encrypted.data);
  const ivBuffer = base64ToArrayBuffer(encrypted.iv);

  // Create Uint8Array from buffer
  const iv = new Uint8Array(ivBuffer);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv, // This is fine
    },
    key,
    dataBuffer // Use ArrayBuffer directly
  );

  return new TextDecoder().decode(decrypted);
}

// 3. Convert base64 to ArrayBuffer (not Uint8Array)
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return buffer;
}

// 4. ArrayBuffer to base64
export function arrayToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// 5. Generate key
export async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// 6. Export/Import
export async function exportKey(key: CryptoKey): Promise<string> {
  const jwk = await crypto.subtle.exportKey("jwk", key);
  return JSON.stringify(jwk);
}

export async function importKey(keyString: string): Promise<CryptoKey> {
  const jwk = JSON.parse(keyString);
  return await crypto.subtle.importKey("jwk", jwk, { name: "AES-GCM" }, true, [
    "encrypt",
    "decrypt",
  ]);
}
