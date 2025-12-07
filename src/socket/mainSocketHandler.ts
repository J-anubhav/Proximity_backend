import { Server, Socket } from 'socket.io';
import { registerPlayerHandlers } from './playerHandler';
import { registerChatHandlers } from './chatHandler';
import { registerWebRTCHandlers } from './webrtcHandler';
import { state } from '../state/stateManager';

export const initializeSocketIO = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log(`New client connected: ${socket.id}`);

        // Register all event handlers
        registerPlayerHandlers(io, socket);
        registerChatHandlers(io, socket);
        registerWebRTCHandlers(io, socket);

        // Handle Disconnect
        socket.on('disconnect', async () => {
            console.log(`Client disconnected: ${socket.id}`);

            // 1. Remove player from state
            await state.removePlayer(socket.id);

            // 2. Broadcast 'user-left'
            socket.broadcast.emit('user-left', socket.id);
        });
    });
};
