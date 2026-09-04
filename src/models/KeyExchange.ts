import mongoose, { Schema, Document } from 'mongoose';

export interface IKeyExchange extends Document {
  conversationId: string;
  initiatorId: string;
  recipientId: string;
  initiatorEphemeralPublicKey: string;
  recipientEphemeralPublicKey?: string;
  status: 'pending' | 'completed' | 'failed';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const KeyExchangeSchema: Schema = new Schema(
  {
    conversationId: { type: String, required: true },
    initiatorId: { type: String, required: true },
    recipientId: { type: String, required: true, index: true },
    initiatorEphemeralPublicKey: { type: String, required: true },
    recipientEphemeralPublicKey: { type: String },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    expiresAt: { type: Date, required: true }
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

export const KeyExchange = mongoose.model<IKeyExchange>('KeyExchange', KeyExchangeSchema);
export default KeyExchange;
