// src/services/encryption/message-encryption.ts
import { CreateMessageRequest } from "@/shared/types/requests/send-message.request";
import { AttachmentUploadRequest } from "@/shared/types/requests/attachment-upload.request";
import { E2EEService } from "./e2ee.service";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";

const e2ee = E2EEService.getInstance();

// Encrypt a single attachment
async function encryptAttachment(
  chatId: string,
  attachment: AttachmentUploadRequest
): Promise<AttachmentUploadRequest> {
  const url = attachment.url
    ? await e2ee.encryptText(chatId, attachment.url)
    : attachment.url;
  const filename = await e2ee.encryptText(chatId, attachment.filename);

  return {
    ...attachment,
    url,
    filename,
  } as AttachmentUploadRequest;
}

// Encrypt all attachments in array
export async function encryptAttachments(
  chatId: string,
  attachments: AttachmentUploadRequest[] = []
) {
  if (attachments.length === 0) return [];

  return Promise.all(
    attachments.map((attachment) => encryptAttachment(chatId, attachment))
  );
}

// Decrypt a single attachment
async function decryptAttachment(
  chatId: string,
  attachment: AttachmentResponse
) {
  const decrypted = { ...attachment };

  if (attachment.url) {
    decrypted.url = await e2ee.decryptText(chatId, attachment.url);
  }

  if (attachment.filename) {
    decrypted.filename = await e2ee.decryptText(chatId, attachment.filename);
  }

  return decrypted;
}

// Decrypt all attachments in array
export async function decryptAttachments(
  chatId: string,
  attachments: AttachmentResponse[] = []
) {
  if (attachments.length === 0) return [];

  return Promise.all(
    attachments.map((attachment) => decryptAttachment(chatId, attachment))
  );
}

// Encrypt complete message
export async function encryptMessage(
  chatId: string,
  message: CreateMessageRequest
) {
  const encrypted = { ...message };

  // Encrypt content if exists
  if (message.content) {
    encrypted.content = await e2ee.encryptText(chatId, message.content);
  }

  // Encrypt attachments if exist
  if (message.attachments?.length) {
    encrypted.attachments = await encryptAttachments(
      chatId,
      message.attachments
    );
  }

  return encrypted;
}

// Decrypt complete message
export async function decryptMessage(
  chatId: string,
  encryptedMessage: MessageResponse
) {
  const decrypted = { ...encryptedMessage };

  // Decrypt content if exists
  if (encryptedMessage.content) {
    decrypted.content = await e2ee.decryptText(
      chatId,
      encryptedMessage.content
    );
  }

  // Decrypt attachments if exist
  if (encryptedMessage.attachments?.length) {
    decrypted.attachments = await decryptAttachments(
      chatId,
      encryptedMessage.attachments
    );
  }

  return decrypted;
}
