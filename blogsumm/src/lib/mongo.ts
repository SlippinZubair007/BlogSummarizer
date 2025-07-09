import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

export const connectMongo = async () => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGODB_URI, { dbName: 'blog_db' });
  console.log('Connected to MongoDB');
};
