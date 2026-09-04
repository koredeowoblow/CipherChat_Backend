import conversationRepository from '../repositories/conversationRepository';
import userRepository from '../repositories/userRepository';
import { AppError } from '../utils/AppError';
import messageHandler from '../websocket/messageHandler';
import { EVENTS } from '../websocket/events';
import { Conversation, User } from '../models';
import connectionManager from '../websocket/connectionManager';

export class ConversationService {
  public async createDirectConversation(initiatorId: string, recipientId: string) {
    if (!initiatorId || !recipientId) {
      throw new AppError('Missing user ID', 400);
    }

    // Check if either user has blocked the other
    const [initiator, recipient] = await Promise.all([
      userRepository.findById(initiatorId),
      userRepository.findById(recipientId)
    ]);

    if (!initiator || !recipient) throw new AppError('User not found', 404);

    const initiatorBlocked = (initiator as any).blockedUsers?.includes(recipientId);
    const recipientBlocked = (recipient as any).blockedUsers?.includes(initiatorId);

    if (initiatorBlocked) throw new AppError('You have blocked this user', 403);
    if (recipientBlocked) throw new AppError('This user is not available', 403);

    const conversation = await conversationRepository.createDirectConversation(initiatorId, recipientId);
    
    // Broadcast to the recipient so it shows up in real-time
    await messageHandler.broadcastToConversation(conversation.id, 'conversation:new', conversation, initiatorId);
    
    return conversation;
  }

  public async acceptConversation(conversationId: string, userId: string) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new AppError('Conversation not found', 404);

    const isParticipant = conversation.participants.some((p: any) => p.userId === userId);
    if (!isParticipant) throw new AppError('Not a participant of this conversation', 403);

    // Only the non-initiator (recipient) can accept
    if (conversation.createdBy === userId) throw new AppError('Only the recipient can accept a request', 403);

    conversation.status = 'accepted';
    await conversation.save();

    // Notify the initiator
    connectionManager.sendToUser(conversation.createdBy, {
      type: 'conversation:accepted',
      payload: { conversationId }
    });

    // Populate user details before returning
    const userIds = conversation.participants.map(p => p.userId);
    const users = await User.find({ _id: { $in: userIds } });
    const userMap = new Map(users.map((u: any) => [u.id || u._id.toString(), { id: u.id || u._id.toString(), username: u.username, avatar: u.avatar }]));
    
    const populatedConversation = {
      ...conversation.toObject(),
      id: conversation._id.toString(),
      participants: conversation.participants.map((p: any) => ({
        ...p.toObject(),
        user: userMap.get(p.userId)
      }))
    };

    return populatedConversation;
  }

  public async rejectConversation(conversationId: string, userId: string) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new AppError('Conversation not found', 404);

    const isParticipant = conversation.participants.some((p: any) => p.userId === userId);
    if (!isParticipant) throw new AppError('Not a participant of this conversation', 403);

    if (conversation.createdBy === userId) throw new AppError('Only the recipient can reject a request', 403);

    // Notify initiator then delete
    connectionManager.sendToUser(conversation.createdBy, {
      type: 'conversation:rejected',
      payload: { conversationId }
    });

    await Conversation.findByIdAndDelete(conversationId);
    return { deleted: true };
  }

  public async getConversations(userId: string) {
    const conversations = await conversationRepository.findAllForUser(userId);
    return conversations;
  }
}

export default new ConversationService();
