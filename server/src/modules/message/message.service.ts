import { Injectable } from '@nestjs/common';
import { Message } from 'src/models/message.model';
import { CreateMessageDto } from 'src/dto/create-message.dto';
import { UpdateMessageDto } from 'src/dto/update-message.dto';

@Injectable()
export class MessageService {
  private messages: Message[] = [];

  // Get all messages (filter out deleted ones by default)
  getMessages(includeDeleted = false): Message[] {
    return includeDeleted
      ? this.messages
      : this.messages.filter((msg) => !msg.isDeleted);
  }

  // Create a new message with proper typing
  createMessage(createMessageDto: CreateMessageDto): Message {
    const { senderId, conversationId, content, media, replyToMessageId } =
      createMessageDto;

    const newMessage = new Message({
      senderId,
      conversationId,
      content: content || '', // Set default empty string for content
      media: media,
      replyToMessageId: replyToMessageId,
      status: 'sent',
      timestamp: new Date(),
    });

    this.messages.push(newMessage);
    return newMessage;
  }

  // Get message by ID (returns actual Message object or undefined)
  getMessageById(id: string): Message | undefined {
    return this.messages.find((msg) => msg.id === id && !msg.isDeleted);
  }

  // Update message content (proper implementation)
  updateMessage(
    id: string,
    updateMessageDto: UpdateMessageDto,
  ): Message | undefined {
    const { content } = updateMessageDto;
    const message = this.getMessageById(id);

    if (message) {
      message.content = content || message.content; // If content is provided, update it, otherwise keep the current content
      message.editedTimestamp = new Date();
      return message;
    }
    return undefined;
  }

  // Delete message (soft delete implementation)
  deleteMessage(id: string): Message | undefined {
    const message = this.getMessageById(id);
    if (message) {
      message.isDeleted = true;
      message.deletedTimestamp = new Date();
      return message;
    }
    return undefined;
  }

  // Additional useful methods
  getMessagesByConversation(conversationId: string): Message[] {
    return this.messages.filter(
      (msg) => msg.conversationId === conversationId && !msg.isDeleted,
    );
  }
}
