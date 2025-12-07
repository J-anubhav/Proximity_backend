import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import apiRoutes from './api/routes';
import { initializeSocketIO } from './socket/mainSocketHandler';

const app = express();
const server = http.createServer(app);
// Setup Socket.io with CORS
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for dev, change for production
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve Static Files (Maps, etc.)
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api', apiRoutes);

// Initialize Socket Handlers
initializeSocketIO(io);

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Map files available at http://localhost:${PORT}/maps/`);
});
