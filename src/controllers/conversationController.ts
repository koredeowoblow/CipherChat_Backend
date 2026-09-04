import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import conversationService from '../services/conversationService';
import { ResponseHandler } from '../utils/responseHandler';
import { ConversationDto } from '../dtos/conversation.dto';

export class ConversationController {
  public async createDirectConversation(req: AuthRequest, res: Response) {
    const { recipientId } = req.body;
    const initiatorId = req.user?.id as string;

    const conversation = await conversationService.createDirectConversation(initiatorId, recipientId);

    return ResponseHandler.success(res, 201, 'Conversation created', ConversationDto.toResponse(conversation));
  }

  public async getConversations(req: AuthRequest, res: Response) {
    const userId = req.user?.id as string;

    const conversations = await conversationService.getConversations(userId);

    return ResponseHandler.success(res, 200, 'Conversations retrieved', ConversationDto.toResponseList(conversations));
  }

  public async acceptConversation(req: AuthRequest, res: Response) {
    const conversationId = req.params.conversationId;
    const userId = req.user?.id as string;
    const conversation = await conversationService.acceptConversation(conversationId, userId);
    return ResponseHandler.success(res, 200, 'Chat request accepted', ConversationDto.toResponse(conversation));
  }

  public async rejectConversation(req: AuthRequest, res: Response) {
    const conversationId = req.params.conversationId;
    const userId = req.user?.id as string;
    await conversationService.rejectConversation(conversationId, userId);
    return ResponseHandler.success(res, 200, 'Chat request rejected');
  }
}

export default new ConversationController();
