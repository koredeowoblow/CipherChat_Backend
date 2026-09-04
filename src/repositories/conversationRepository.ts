import { Conversation, User } from '../models';

export class ConversationRepository {
  public async createDirectConversation(initiatorId: string, recipientId: string) {
    const doc = await Conversation.create({
      isGroup: false,
      createdBy: initiatorId,
      participants: [
        { userId: initiatorId, role: 'admin' },
        { userId: recipientId, role: 'member' }
      ]
    });

    const users = await User.find({ _id: { $in: [initiatorId, recipientId] } }).select('id username avatar').lean();
    const userMap = new Map(users.map(u => [u._id.toString(), { id: u._id.toString(), username: u.username, avatar: u.avatar }]));

    const populatedParticipants = doc.participants.map((p: any) => ({
      ...p.toObject(),
      user: userMap.get(p.userId)
    }));

    return {
      ...doc.toObject(),
      id: doc._id.toString(),
      participants: populatedParticipants
    };
  }

  public async updateLastMessage(conversationId: string) {
    return Conversation.findByIdAndUpdate(
      conversationId,
      { lastMessageAt: new Date() },
      { new: true }
    );
  }

  public async findParticipant(conversationId: string, userId: string) {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.userId': userId
    });
    
    if (!conversation) return null;
    
    return conversation.participants.find(p => p.userId === userId);
  }

  public async findAllForUser(userId: string) {
    // Find conversations where the user is a participant
    const conversations = await Conversation.find({
      'participants.userId': userId
    })
    .sort({ lastMessageAt: -1 })
    .lean();

    // Since we're using lean(), virtuals won't be applied automatically if we manually construct the object.
    // However, we want to return a populated result similar to before. 
    // In Mongoose, doing `$lookup` or manual population is needed if User data is in another collection.
    // Let's manually fetch the users for these conversations.
    
    const userIds = new Set<string>();
    conversations.forEach(c => {
      c.participants.forEach(p => userIds.add(p.userId));
    });

    const users = await User.find({ _id: { $in: Array.from(userIds) } })
      .select('id username avatar')
      .lean();
    
    const userMap = new Map(users.map(u => [u._id.toString(), { id: u._id.toString(), username: u.username, avatar: u.avatar }]));

    return conversations.map(c => {
      // Map participants to include populated user
      const populatedParticipants = c.participants.map(p => ({
        ...p,
        user: userMap.get(p.userId)
      }));

      return {
        ...c,
        id: c._id.toString(), // Add virtual id manually since lean() strips it
        participants: populatedParticipants
      };
    });
  }
}

export default new ConversationRepository();
