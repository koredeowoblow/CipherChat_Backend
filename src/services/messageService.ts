import messageRepository from '../repositories/messageRepository';
import conversationRepository from '../repositories/conversationRepository';
import messageHandler from '../websocket/messageHandler';
import { EVENTS } from '../websocket/events';
import { AppError } from '../utils/AppError';

export class MessageService {
  public async sendMessage(data: any, senderId: string) {
    const { conversationId, encryptedContent, encryptedSessionKey, iv, authTag } = data;

    const participant = await conversationRepository.findParticipant(conversationId, senderId);
    if (!participant) {
      throw new AppError('Not authorized to send messages to this conversation', 403);
    }

    const message = await messageRepository.create({
      conversationId,
      senderId,
      encryptedContent,
      encryptedSessionKey,
      iv,
      authTag
    });

    await conversationRepository.updateLastMessage(conversationId);

    await messageHandler.broadcastToConversation(
      conversationId,
      EVENTS.MESSAGE_NEW,
      message,
      senderId
    );

    return message;
  }

  public async getMessages(conversationId: string, userId: string) {
    const participant = await conversationRepository.findParticipant(conversationId, userId);
    if (!participant) {
      throw new AppError('Not authorized to view these messages', 403);
    }

    return messageRepository.findAllByConversation(conversationId);
  }
}

export default new MessageService();
