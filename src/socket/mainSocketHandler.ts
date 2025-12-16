import { Server, Socket } from 'socket.io';
import { registerPlayerHandlers } from './playerHandler';
import { registerChatHandlers } from './chatHandler';
import { registerWebRTCHandlers } from './webrtcHandler';
import { registerKanbanHandlers } from './kanbanHandler';
import { registerRoomHandlers } from './roomHandler';
import { state } from '../state/stateManager';
import { User, WorkSession, calculateWorkTime } from '../models';

export const initializeSocketIO = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log(`New client connected: ${socket.id}`);

        // Register all event handlers
        registerPlayerHandlers(io, socket);
        registerChatHandlers(io, socket);
        registerWebRTCHandlers(io, socket);
        registerKanbanHandlers(io, socket);
        registerRoomHandlers(io, socket);

        // Handle Disconnect
        socket.on('disconnect', async () => {
            console.log(`Client disconnected: ${socket.id}`);

            const userId = (socket as any).userId;
            const roomCode = (socket as any).roomCode;
            const username = (socket as any).username;

            // 1. Remove player from state
            await state.removePlayer(socket.id);

            // 2. Handle work session logout if authenticated
            if (userId) {
                try {
                    // Find and close open work session
                    const session = await WorkSession.findOne({
                        userId,
                        logoutTime: null
                    });

                    if (session) {
                        const now = new Date();
                        const workTime = calculateWorkTime(session.loginTime, now);
                        session.logoutTime = now;
                        session.totalMinutes = workTime.totalMinutes;
                        session.category = workTime.category;
                        await session.save();

                        // Update user
                        await User.findByIdAndUpdate(userId, {
                            lastLogout: now,
                            currentRoomId: null
                        });

                        // Broadcast user left with work time info
                        if (roomCode) {
                            io.to(roomCode.toUpperCase()).emit('user-left', {
                                socketId: socket.id,
                                username: username || 'Unknown',
                                workTime: workTime.displayText,
                                notification: {
                                    type: 'user',
                                    message: `${username || 'User'} left (${workTime.displayText})`
                                }
                            });
                        }

                        console.log(`User ${username} logged out after ${workTime.displayText}`);
                    }
                } catch (error) {
                    console.error('Error handling disconnect work session:', error);
                }
            }

            // 3. Broadcast 'user-left' for non-authenticated sockets
            if (!userId) {
                socket.broadcast.emit('user-left', socket.id);
            }
        });
    });
};

