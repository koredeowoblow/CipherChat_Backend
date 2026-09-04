import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/e2e_chat';

export const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

export default mongoose;
