import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import messageService from "../services/messageService";
import { ResponseHandler } from "../utils/responseHandler";
import { MessageDto } from "../dtos/message.dto";

export class MessageController {
  public async sendMessage(req: AuthRequest, res: Response) {
    const senderId = req.user?.id as string;
    const message = await messageService.sendMessage(req.body, senderId);

    return ResponseHandler.success(res, 201, "Message sent successfully", {
      id: message.id,
      createdAt: message.createdAt,
    });
  }

  public async getMessages(req: AuthRequest, res: Response) {
    const conversationId = req.params.conversationId as string;
    const userId = req.user?.id as string;

    const messages = await messageService.getMessages(conversationId, userId);

    return ResponseHandler.success(
      res,
      200,
      "Messages retrieved",
      MessageDto.toResponseList(messages),
    );
  }

  public async reactToMessage(req: AuthRequest, res: Response) {
    const messageId = req.params.messageId as string;
    const userId = req.user?.id as string;
    const { emoji } = req.body;

    const message = await messageService.reactToMessage(
      messageId,
      userId,
      emoji,
    );

    return ResponseHandler.success(
      res,
      200,
      "Reaction updated",
      MessageDto.toResponse(message),
    );
  }
}

export default new MessageController();
