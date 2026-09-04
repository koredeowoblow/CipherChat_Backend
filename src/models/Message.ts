import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationId: string;
  senderId: string;
  encryptedContent: string;
  encryptedSessionKey: string;
  iv: string;
  authTag: string;
  isRead: boolean;
  isDelivered: boolean;
  createdAt: Date;
  updatedAt: Date;
  reactions: Array<{ emoji: string; userId: string }>;
}

const MessageSchema: Schema = new Schema(
  {
    conversationId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    encryptedContent: { type: String, required: true },
    encryptedSessionKey: { type: String, required: true },
    iv: { type: String, required: true },
    authTag: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    isDelivered: { type: Boolean, default: false },
    reactions: [{
      emoji: { type: String, required: true },
      userId: { type: String, required: true }
    }]
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret: any) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
export default Message;
