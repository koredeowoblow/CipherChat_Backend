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

  public async reactToMessage(messageId: string, userId: string, emoji: string) {
    const message = await messageRepository.findById(messageId);
    if (!message) {
      throw new AppError('Message not found', 404);
    }
    
    // Check if user is participant
    const participant = await conversationRepository.findParticipant(message.conversationId, userId);
    if (!participant) {
      throw new AppError('Not authorized', 403);
    }

    const existingReactionIndex = message.reactions.findIndex((r: any) => r.userId === userId && r.emoji === emoji);
    if (existingReactionIndex !== -1) {
      // Toggle off
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      // Toggle on
      message.reactions.push({ emoji, userId });
    }

    await message.save();

    await messageHandler.broadcastToConversation(
      message.conversationId,
      'message:reaction', // Using string directly instead of EVENT since it's not defined yet
      { messageId, conversationId: message.conversationId, reactions: message.reactions }
    );

    return message;
  }
}

export default new MessageService();
