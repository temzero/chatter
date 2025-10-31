import API from "@/services/api/api";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { PaginationQuery } from "@/shared/types/queries/pagination-query";
import { PaginationResponse } from "@/shared/types/responses/pagination.response";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";

export const attachmentService = {
  async fetchChatAttachments(
    chatId: string,
    type?: AttachmentType,
    query?: PaginationQuery
  ): Promise<PaginationResponse<AttachmentResponse>> {
    const route = type
      ? `/attachments/chat/${chatId}/attachment-type/${type}`
      : `/attachments/chat/${chatId}`;

    const { data } = await API.get(route, {
      params: query,
    });

    return data.payload;
  },

  async fetchAttachmentCount(chatId: string): Promise<number> {
    const { data } = await API.get(`/attachments/count/chat/${chatId}`);
    return data.payload.count;
  },

  async fetchAttachmentsCountByType(
    chatId: string
  ): Promise<Record<string, number>> {
    const { data } = await API.get(`/attachments/count-by-type/chat/${chatId}`);
    return data.payload;
  },

  async fetchAttachment(attachmentId: string): Promise<AttachmentResponse> {
    const { data } = await API.get(`/attachments/${attachmentId}`);
    return data.payload;
  },

  async deleteAttachment(attachmentId: string): Promise<void> {
    await API.delete(`/attachments/${attachmentId}`);
  },
};
