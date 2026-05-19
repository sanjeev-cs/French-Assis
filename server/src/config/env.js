import dotenv from 'dotenv';

dotenv.config();

const stripTrailingSlash = (value) => value?.replace(/\/+$/, '');

export const env = {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI,
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: stripTrailingSlash(process.env.CLIENT_ORIGIN) || 'http://localhost:5173'
};
