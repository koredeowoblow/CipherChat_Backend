export class ConversationDto {
  public id: string;
  public isGroup: boolean;
  public name?: string;
  public avatar?: string;
  public lastMessageAt: string;
  public status: string;
  public createdBy: string;
  public participants: any[];

  constructor(conversation: any) {
    this.id = conversation.id;
    this.isGroup = conversation.isGroup;
    this.name = conversation.name;
    this.avatar = conversation.avatar;
    this.lastMessageAt = conversation.lastMessageAt;
    this.status = conversation.status || 'pending';
    this.createdBy = conversation.createdBy;
    
    // Map participants if they are populated
    if (conversation.participants) {
      this.participants = conversation.participants.map((p: any) => {
        return {
          role: p.role,
          user: p.user ? {
            id: p.user.id,
            username: p.user.username,
            avatar: p.user.avatar,
          } : undefined
        };
      });
    } else {
      this.participants = [];
    }
  }

  public static toResponse(conversation: any) {
    return new ConversationDto(conversation);
  }

  public static toResponseList(conversations: any[]) {
    return conversations.map(c => new ConversationDto(c));
  }
}
