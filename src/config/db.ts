import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/proximity';

export const connectMongoDB = async (): Promise<void> => {
    try {
        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
};

export const disconnectMongoDB = async (): Promise<void> => {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
};
