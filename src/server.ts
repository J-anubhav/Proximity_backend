import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { config } from './config/config';
import { connectRedis, redisClient } from './config/redis';
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
        try {
            await connectRedis();
        } catch (err) {
            console.warn("⚠️ Redis connection failed. Disconnecting and falling back to in-memory state.");
            try {
                // Stop retrying
                await redisClient.disconnect();
            } catch (disconnectErr) {
                // Ignore disconnect error
            }
        }

        // 2. Initialize Socket Handlers
        initializeSocketIO(io);

        // 3. Start Listening
        server.listen(config.port, () => {
            console.log(`🚀 Pixel Server running on port ${config.port}`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
