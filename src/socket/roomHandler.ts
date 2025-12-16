import { Socket, Server } from 'socket.io';
import { Room, User, WorkSession, calculateWorkTime } from '../models';
import { verifyToken } from '../middleware/auth';

export const registerRoomHandlers = (io: Server, socket: Socket) => {

    /**
     * Event: authenticate
     * Authenticate socket connection with JWT token
     */
    socket.on('authenticate', async (data: { token: string }) => {
        try {
            const decoded = verifyToken(data.token);
            if (!decoded) {
                socket.emit('auth-error', { message: 'Invalid token' });
                return;
            }

            // Store user info on socket
            (socket as any).userId = decoded.userId;
            (socket as any).roomId = decoded.roomId;
            (socket as any).roomCode = decoded.roomCode;
            (socket as any).username = decoded.username;

            socket.emit('authenticated', { success: true });
            console.log(`Socket ${socket.id} authenticated as ${decoded.username}`);
        } catch (error) {
            console.error('Socket auth error:', error);
            socket.emit('auth-error', { message: 'Authentication failed' });
        }
    });

    /**
     * Event: room-abolished
     * Broadcast when room creator abolishes the room
     * (Called from HTTP route, but handled here for reference)
     */
    socket.on('abolish-room', async () => {
        try {
            const roomCode = (socket as any).roomCode;
            const userId = (socket as any).userId;

            if (!roomCode || !userId) {
                socket.emit('error', { message: 'Not authenticated' });
                return;
            }

            // Verify user is creator
            const room = await Room.findOne({ code: roomCode, isActive: true });
            if (!room) {
                socket.emit('error', { message: 'Room not found' });
                return;
            }

            if (room.creatorId.toString() !== userId) {
                socket.emit('error', { message: 'Only room creator can abolish' });
                return;
            }

            // Deactivate room
            room.isActive = false;
            await room.save();

            // Close all work sessions for users in this room
            const openSessions = await WorkSession.find({
                roomId: room._id,
                logoutTime: null
            });

            for (const session of openSessions) {
                const now = new Date();
                const workTime = calculateWorkTime(session.loginTime, now);
                session.logoutTime = now;
                session.totalMinutes = workTime.totalMinutes;
                session.category = workTime.category;
                await session.save();
            }

            // Clear all users' currentRoomId
            await User.updateMany(
                { currentRoomId: room._id },
                { $set: { currentRoomId: null, lastLogout: new Date() } }
            );

            // Broadcast to all in room
            io.to(roomCode).emit('room-abolished', {
                message: 'Room has been abolished by the creator',
                notification: {
                    type: 'room',
                    message: 'Room abolished! Returning to home...'
                }
            });

            console.log(`Room ${roomCode} abolished by creator`);
        } catch (error) {
            console.error('Abolish room error:', error);
            socket.emit('error', { message: 'Failed to abolish room' });
        }
    });
};

/**
 * Utility function to broadcast room abolishment
 * Called from HTTP controller
 */
export async function broadcastRoomAbolished(io: Server, roomCode: string) {
    io.to(roomCode.toUpperCase()).emit('room-abolished', {
        message: 'Room has been abolished by the creator',
        notification: {
            type: 'room',
            message: 'Room abolished! Returning to home...'
        }
    });
}
