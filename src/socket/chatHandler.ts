import { Socket, Server } from 'socket.io';
import { state } from '../state/stateManager';
import { ChatMessage } from '../types';
import { v4 as uuidv4 } from 'uuid'; // You might need to install uuid or just use a simple random string

// Simple ID generator if uuid is not installed, or use Date.now()
const generateId = () => Math.random().toString(36).substr(2, 9);

export const registerChatHandlers = (io: Server, socket: Socket) => {
    // Event: send-global-chat
    socket.on('send-global-chat', (data: { message: string }) => {
        const player = state.getPlayerById(socket.id);
        if (!player) return;

        const chatMessage: ChatMessage = {
            id: generateId(),
            authorId: player.id,
            authorName: player.username,
            content: data.message,
            timestamp: Date.now(),
            type: 'global'
        };

        // Emit to everyone (including sender)
        io.emit('receive-global-chat', chatMessage);
    });

    // Event: send-private-dm
    socket.on('send-private-dm', (data: { targetSocketId: string; message: string }) => {
        const player = state.getPlayerById(socket.id);
        if (!player) return;

        const chatMessage: ChatMessage = {
            id: generateId(),
            authorId: player.id,
            authorName: player.username,
            content: data.message,
            timestamp: Date.now(),
            type: 'private',
            targetId: data.targetSocketId
        };

        // Emit to target
        io.to(data.targetSocketId).emit('receive-private-dm', chatMessage);

        // Optional: Emit back to sender so they see their own DM
        socket.emit('receive-private-dm', chatMessage);
    });
};
