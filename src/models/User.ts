import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  publicKey: string;
  keyFingerprint: string;
  displayName?: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: Date;
  encryptionEnabled: boolean;
  blockedUsers: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    publicKey: { type: String, required: true, unique: true },
    keyFingerprint: { type: String, required: true },
    displayName: { type: String },
    avatar: { type: String },
    status: { type: String, enum: ['online', 'offline', 'away'], default: 'offline' },
    lastSeen: { type: Date, default: Date.now },
    encryptionEnabled: { type: Boolean, default: true },
    blockedUsers: [{ type: String }]
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

export const User = mongoose.model<IUser>('User', UserSchema);
export default User;
