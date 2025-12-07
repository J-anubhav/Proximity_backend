import { Socket, Server } from 'socket.io';
import { WebRTCSignal } from '../types';

export const registerWebRTCHandlers = (io: Server, socket: Socket) => {
    // Event: send-signal
    socket.on('send-signal', (data: WebRTCSignal) => {
        // Relay signal to target
        io.to(data.targetSocketId).emit('receive-signal', {
            fromUserId: socket.id,
            signal: data.signal
        });
    });

    // Event: close-peer
    socket.on('close-peer', (data: { targetSocketId: string }) => {
        io.to(data.targetSocketId).emit('close-peer', {
            fromUserId: socket.id
        });
    });
};
