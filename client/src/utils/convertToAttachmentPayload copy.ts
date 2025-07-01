// import { AttachmentUploadRequest } from "@/types/requests/sendMessage.request";
// import { AttachmentType } from "@/types/enums/attachmentType";
// import { toast } from "react-toastify";

// function arrayBufferToBase64(buffer: ArrayBuffer): string {
//   const bytes = new Uint8Array(buffer);
//   let binary = "";
//   for (let i = 0; i < bytes.byteLength; i++) {
//     binary += String.fromCharCode(bytes[i]);
//   }
//   return btoa(binary);
// }

// export async function convertToAttachmentPayload(
//   file: File
// ): Promise<AttachmentUploadRequest> {
//   const type: AttachmentType = file.type.startsWith("image/")
//     ? AttachmentType.IMAGE
//     : AttachmentType.FILE;

//   const buffer = await file.arrayBuffer();
//   const base64 = arrayBufferToBase64(buffer);

//   toast.success(`attachment type: ${file.type}`);

//   return {
//     type,
//     filename: file.name,
//     size: file.size,
//     mimeType: file.type,
//     data: base64,
//   };
// }
