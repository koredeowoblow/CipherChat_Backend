import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import messageService from '../services/messageService';
import { ResponseHandler } from '../utils/responseHandler';
import { MessageDto } from '../dtos/message.dto';

export class MessageController {
  public async sendMessage(req: AuthRequest, res: Response) {
    const senderId = req.user?.id as string;
    const message = await messageService.sendMessage(req.body, senderId);

    return ResponseHandler.success(res, 201, 'Message sent successfully', {
      id: message.id,
      createdAt: message.createdAt
    });
  }

  public async getMessages(req: AuthRequest, res: Response) {
    const conversationId = req.params.conversationId as string;
    const userId = req.user?.id as string;

    const messages = await messageService.getMessages(conversationId, userId);

    return ResponseHandler.success(res, 200, 'Messages retrieved', MessageDto.toResponseList(messages));
  }
}

export default new MessageController();
