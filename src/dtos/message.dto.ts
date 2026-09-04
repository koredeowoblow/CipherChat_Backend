export class MessageDto {
  public id: string;
  public conversationId: string;
  public senderId: string;
  public encryptedContent: string;
  public encryptedSessionKey: string;
  public iv: string;
  public authTag: string;
  public createdAt: string;
  public reactions: Array<{ emoji: string; userId: string }>;

  constructor(message: any) {
    this.id = message.id;
    this.conversationId = message.conversationId;
    this.senderId = message.senderId;
    this.encryptedContent = message.encryptedContent;
    this.encryptedSessionKey = message.encryptedSessionKey;
    this.iv = message.iv;
    this.authTag = message.authTag;
    this.createdAt = message.createdAt;
    this.reactions = message.reactions || [];
  }

  public static toResponse(message: any) {
    return new MessageDto(message);
  }

  public static toResponseList(messages: any[]) {
    return messages.map(m => new MessageDto(m));
  }
}
