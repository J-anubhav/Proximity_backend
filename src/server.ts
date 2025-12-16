import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { config } from './config/config';
import { connectRedis, redisClient } from './config/redis';
import { connectMongoDB } from './config/db';
import { initializeSocketIO } from './socket/mainSocketHandler';

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: config.corsOrigin,
        methods: ["GET", "POST"]
    }
});

const startServer = async () => {
    try {
        // 1. Connect to MongoDB
        try {
            await connectMongoDB();
        } catch (err) {
            console.error("❌ MongoDB connection failed:", err);
            process.exit(1); // MongoDB is required
        }

        // 2. Connect to Redis (optional, falls back to in-memory)
        try {
            await connectRedis();
        } catch (err) {
            console.warn("⚠️ Redis connection failed. Disconnecting and falling back to in-memory state.");
            try {
                await redisClient.disconnect();
            } catch (disconnectErr) {
                // Ignore disconnect error
            }
        }

        // 3. Initialize Socket Handlers
        initializeSocketIO(io);

        // 4. Start Listening
        server.listen(config.port, () => {
            console.log(`🚀 Pixel Server running on port ${config.port}`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

