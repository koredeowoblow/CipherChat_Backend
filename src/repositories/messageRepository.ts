import { Message } from '../models';

export class MessageRepository {
  public async create(data: any) {
    return Message.create(data);
  }

  public async findAllByConversation(conversationId: string, limit: number = 50) {
    return Message.find({ conversationId })
      .sort({ createdAt: 1 }) // 1 for ascending
      .limit(limit);
  }

  public async findById(id: string) {
    return Message.findById(id);
  }
}

export default new MessageRepository();
