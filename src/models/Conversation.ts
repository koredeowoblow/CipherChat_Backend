import mongoose, { Schema, Document } from 'mongoose';

export interface IParticipant {
  userId: string;
  role: 'admin' | 'member';
  joinedAt: Date;
  lastReadAt: Date;
  encryptedConversationKey?: string;
}

export interface IConversation extends Document {
  isGroup: boolean;
  name?: string;
  avatar?: string;
  description?: string;
  createdBy: string;
  status: 'pending' | 'accepted' | 'rejected';
  lastMessageAt: Date;
  participants: IParticipant[];
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
    lastReadAt: { type: Date, default: Date.now },
    encryptedConversationKey: { type: String }
  },
  { _id: false }
);

const ConversationSchema: Schema = new Schema(
  {
    isGroup: { type: Boolean, default: false },
    name: { type: String },
    avatar: { type: String },
    description: { type: String },
    createdBy: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    lastMessageAt: { type: Date, default: Date.now },
    participants: [ParticipantSchema]
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

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
export default Conversation;
