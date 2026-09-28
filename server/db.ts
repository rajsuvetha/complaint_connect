import mongoose from 'mongoose';

export async function connectDB(): Promise<boolean> {
  const url = process.env.MONGO_URL || 'mongodb://0.0.0.0:27017/complaint_connect';
  try {
    console.log(` Attempting connection to MongoDB at ${url}...`);
    await mongoose.connect(url, { serverSelectionTimeoutMS: 2000 });
    console.log(" MongoDB connected successfully!");
    return true;
  } catch (err: any) {
    console.warn(" Local MongoDB on 27017 not available. Running in In-Memory Mode!");
    return false;
  }
}


