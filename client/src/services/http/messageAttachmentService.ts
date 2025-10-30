import API from "@/services/api/api";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { PaginationQuery } from "@/shared/types/queries/pagination-query";
import { PaginationResponse } from "@/shared/types/responses/pagination.response";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";

export const attachmentService = {
  async getChatAttachments(
    chatId: string,
    type: AttachmentType,
    queries?: PaginationQuery
  ): Promise<PaginationResponse<AttachmentResponse>> {
    const { data } = await API.get(
      `/attachments/chat/${chatId}/attachment-type/${type}`,
      {
        params: queries,
      }
    );

    return data.payload;
  },

  async getAllChatAttachments(
    chatId: string,
    queries?: PaginationQuery
  ): Promise<PaginationResponse<AttachmentResponse>> {
    const { data } = await API.get(`/attachments/chat/${chatId}`, {
      params: queries,
    });

    return data.payload;
  },

  async getAttachmentCount(chatId: string): Promise<number> {
    const { data } = await API.get(`/attachments/count/chat/${chatId}`);
    return data.payload.count;
  },

  async getAttachmentsCountByType(
    chatId: string
  ): Promise<Record<string, number>> {
    const { data } = await API.get(`/attachments/count-by-type/chat/${chatId}`);
    return data.payload;
  },

  async getAttachment(attachmentId: string): Promise<AttachmentResponse> {
    const { data } = await API.get(`/attachments/${attachmentId}`);
    return data.payload;
  },

  async deleteAttachment(attachmentId: string): Promise<void> {
    await API.delete(`/attachments/${attachmentId}`);
  },
};
