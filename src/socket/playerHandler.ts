import { Socket, Server } from 'socket.io';
import { state } from '../state/stateManager';
import { mapService } from '../services/mapService';
import { User, Room, WorkSession } from '../models';
import { verifyToken } from '../middleware/auth';

export const registerPlayerHandlers = (io: Server, socket: Socket) => {

    /**
     * Event: join-room
     * Join a room with authentication token or credentials
     */
    socket.on('join-room', async (data: {
        username?: string;
        avatar?: string;
        roomCode?: string;
        token?: string;
    }) => {
        try {
            let userId: string;
            let roomCode: string;
            let username: string;
            let avatar: string;
            let roomId: string;

            // Authenticate via token or use provided credentials
            if (data.token) {
                const decoded = verifyToken(data.token);
                if (!decoded) {
                    socket.emit('join-error', { message: 'Invalid or expired token' });
                    return;
                }
                userId = decoded.userId;
                roomCode = decoded.roomCode;
                username = decoded.username;
                roomId = decoded.roomId;

                // Fetch avatar from DB
                const user = await User.findById(userId);
                avatar = user?.avatar || 'default';
            } else {
                // Legacy join without token (backward compatibility)
                if (!data.username || !data.roomCode) {
                    socket.emit('join-error', { message: 'Username and room code required' });
                    return;
                }

                // Verify room exists
                const room = await Room.findOne({
                    code: data.roomCode.toUpperCase(),
                    isActive: true,
                    expiresAt: { $gt: new Date() }
                });

                if (!room) {
                    socket.emit('join-error', { message: 'Room not found or expired' });
                    return;
                }

                // Create or find user
                const user = await User.create({
                    username: data.username,
                    avatar: data.avatar || 'default',
                    currentRoomId: room._id,
                    lastLogin: new Date()
                });

                userId = user._id.toString();
                roomCode = room.code;
                username = data.username;
                avatar = data.avatar || 'default';
                roomId = room._id.toString();
            }

            // Store user info on socket for disconnect handling
            (socket as any).userId = userId;
            (socket as any).roomId = roomId;
            (socket as any).roomCode = roomCode;
            (socket as any).username = username;

            // Join socket.io room
            socket.join(roomCode.toUpperCase());
            console.log(`Player joined room ${roomCode}: ${socket.id} (${username})`);

            // Create work session
            await WorkSession.create({
                userId,
                roomId,
                loginTime: new Date()
            });

            // Update user's last login
            await User.findByIdAndUpdate(userId, {
                lastLogin: new Date(),
                currentRoomId: roomId
            });

            // Add player to Redis state
            const newPlayer = await state.addPlayer(socket.id, {
                username,
                avatar
            });

            // Emit 'current-users' to THIS socket
            const allPlayers = await state.getAllPlayers();
            socket.emit('current-users', allPlayers);

            // Broadcast 'new-user-joined' to room with notification
            socket.to(roomCode.toUpperCase()).emit('new-user-joined', {
                ...newPlayer,
                notification: {
                    type: 'user',
                    message: `${username} joined the room`
                }
            });

        } catch (error) {
            console.error('Join room error:', error);
            socket.emit('join-error', { message: 'Failed to join room' });
        }
    });

    /**
     * Event: quit-room
     * Explicitly leave room (triggers work time calculation)
     */
    socket.on('quit-room', async () => {
        const userId = (socket as any).userId;
        const roomCode = (socket as any).roomCode;
        const username = (socket as any).username;

        if (!userId || !roomCode) {
            socket.emit('error', { message: 'Not in a room' });
            return;
        }

        try {
            // Find and close open work session
            const session = await WorkSession.findOne({
                userId,
                logoutTime: null
            });

            let workTimeDisplay = 'Unknown';

            if (session) {
                const now = new Date();
                const { calculateWorkTime } = await import('../models/WorkSession');
                const workTime = calculateWorkTime(session.loginTime, now);
                session.logoutTime = now;
                session.totalMinutes = workTime.totalMinutes;
                session.category = workTime.category;
                await session.save();
                workTimeDisplay = workTime.displayText;

                // Update user
                await User.findByIdAndUpdate(userId, {
                    lastLogout: now,
                    currentRoomId: null
                });
            }

            // Remove from state
            await state.removePlayer(socket.id);

            // Leave socket.io room
            socket.leave(roomCode.toUpperCase());

            // Broadcast to room
            io.to(roomCode.toUpperCase()).emit('user-left', {
                socketId: socket.id,
                username,
                workTime: workTimeDisplay,
                notification: {
                    type: 'user',
                    message: `${username} left (${workTimeDisplay})`
                }
            });

            // Clear socket data
            (socket as any).userId = null;
            (socket as any).roomId = null;
            (socket as any).roomCode = null;
            (socket as any).username = null;

            // Confirm to client
            socket.emit('quit-success', {
                message: 'Left room successfully',
                workTime: workTimeDisplay
            });

            console.log(`Player ${username} quit room ${roomCode} after ${workTimeDisplay}`);

        } catch (error) {
            console.error('Quit room error:', error);
            socket.emit('error', { message: 'Failed to quit room' });
        }
    });

    /**
     * Event: player-move
     * Handle player movement (existing logic, with room scoping)
     */
    socket.on('player-move', async (data: { x: number; y: number; direction: string }) => {
        const roomCode = (socket as any).roomCode;

        // Calculate Zone
        const currentZone = mapService.getZone(data.x, data.y);
        const newRoomName = currentZone ? currentZone.name : null;

        // Get Old State to check for change
        const oldPlayerState = await state.getPlayerById(socket.id);
        const oldRoomName = oldPlayerState?.currentRoom || null;

        // Update Redis
        const updatedPlayer = await state.updatePlayerPosition(socket.id, {
            ...data,
            currentRoom: newRoomName
        });

        if (updatedPlayer) {
            // Zone Change Check (Jitsi Trigger)
            if (newRoomName !== oldRoomName) {
                console.log(`Player ${socket.id} moved: ${oldRoomName} -> ${newRoomName}`);
                socket.emit('room-changed', {
                    entered: newRoomName,
                    left: oldRoomName
                });
            }

            // Broadcast 'player-moved' to room (or all if no room)
            if (roomCode) {
                socket.to(roomCode.toUpperCase()).emit('player-moved', updatedPlayer);
            } else {
                socket.broadcast.emit('player-moved', updatedPlayer);
            }
        }
    });
};

