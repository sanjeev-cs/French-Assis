import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDatabase = async () => {
  if (!env.mongodbUri) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(env.mongodbUri);
  console.log('MongoDB connected');
};
