import { AuthenticatedWebSocket } from './connectionManager';
import connectionManager from './connectionManager';
import { EVENTS } from './events';
import conversationRepository from '../repositories/conversationRepository';
import { Conversation } from '../models';

export class MessageHandler {
  public async handleMessage(ws: AuthenticatedWebSocket, data: any) {
    try {
      const { type, payload } = data;

      switch (type) {
        case EVENTS.USER_TYPING: // 'user:typing'
          await this.handleTyping(ws, payload);
          break;
        default:
          console.warn(`Unknown websocket event type: ${type}`);
      }
    } catch (error) {
      console.error('WebSocket message handling error:', error);
    }
  }

  private async handleTyping(ws: AuthenticatedWebSocket, payload: { conversationId: string; isTyping: boolean }) {
    const { conversationId, isTyping } = payload;
    
    // Verify user is in conversation
    const participant = await conversationRepository.findParticipant(conversationId, ws.userId);

    if (!participant) return;

    // Get all participants to broadcast to
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return;

    // Broadcast to everyone else in the conversation
    conversation.participants.forEach((p: any) => {
      const participantId = p.userId?.toString ? p.userId.toString() : p.userId;
      if (participantId !== ws.userId) {
        connectionManager.sendToUser(participantId, {
          type: EVENTS.USER_TYPING,
          payload: {
            conversationId,
            userId: ws.userId,
            isTyping
          }
        });
      }
    });
  }

  public async broadcastToConversation(conversationId: string, eventType: string, payload: any, excludeUserId?: string) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return;

    conversation.participants.forEach((p: any) => {
      if (p.userId !== excludeUserId) {
        connectionManager.sendToUser(p.userId, {
          type: eventType,
          payload
        });
      }
    });
  }
}

export default new MessageHandler();
