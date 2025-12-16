import { Request, Response } from 'express';
import { Room, User, WorkSession } from '../models';
import { generateRoomCode, normalizeRoomCode, isValidRoomCode } from '../utils/roomCode';
import { generateToken, AuthenticatedRequest } from '../middleware/auth';

/**
 * POST /api/v1/rooms/create
 * Create a new room with a unique 6-char code
 */
export const createRoom = async (req: Request, res: Response) => {
    try {
        const { username, avatar, roomName } = req.body;

        // Validation
        if (!username || username.length < 2) {
            return res.status(400).json({ error: 'Username must be at least 2 characters' });
        }
        if (!roomName || roomName.length < 1) {
            return res.status(400).json({ error: 'Room name is required' });
        }

        // Generate unique room code (retry if collision)
        let code: string;
        let attempts = 0;
        do {
            code = generateRoomCode();
            const existing = await Room.findOne({ code, isActive: true });
            if (!existing) break;
            attempts++;
        } while (attempts < 10);

        if (attempts >= 10) {
            return res.status(500).json({ error: 'Failed to generate unique room code' });
        }

        // Create user
        const user = await User.create({
            username,
            avatar: avatar || 'default',
            lastLogin: new Date()
        });

        // Create room with 24-hour expiry
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const room = await Room.create({
            code,
            name: roomName,
            creatorId: user._id,
            expiresAt,
            isActive: true
        });

        // Update user's current room
        user.currentRoomId = room._id;
        await user.save();

        // Generate JWT token for session persistence
        const token = generateToken({
            userId: user._id.toString(),
            roomId: room._id.toString(),
            roomCode: code,
            username
        });

        // Calculate spawn position
        const spawnX = 400 + Math.floor(Math.random() * 50);
        const spawnY = 300 + Math.floor(Math.random() * 50);

        return res.status(201).json({
            success: true,
            token,
            userId: user._id,
            username,
            avatar: user.avatar,
            roomId: room._id,
            roomCode: code,
            roomName: room.name,
            isCreator: true,
            expiresAt,
            spawn: { x: spawnX, y: spawnY }
        });

    } catch (error) {
        console.error('Create room error:', error);
        return res.status(500).json({ error: 'Failed to create room' });
    }
};

/**
 * POST /api/v1/rooms/join
 * Join an existing room by code
 */
export const joinRoom = async (req: Request, res: Response) => {
    try {
        const { username, avatar, roomCode } = req.body;

        // Validation
        if (!username || username.length < 2) {
            return res.status(400).json({ error: 'Username must be at least 2 characters' });
        }
        if (!roomCode || !isValidRoomCode(roomCode)) {
            return res.status(400).json({ error: 'Invalid room code format' });
        }

        // Normalize code (case-insensitive)
        const normalizedCode = normalizeRoomCode(roomCode);

        // Find active room
        const room = await Room.findOne({
            code: normalizedCode,
            isActive: true,
            expiresAt: { $gt: new Date() }
        });

        if (!room) {
            return res.status(404).json({ error: 'Room not found or expired' });
        }

        // Create user
        const user = await User.create({
            username,
            avatar: avatar || 'default',
            currentRoomId: room._id,
            lastLogin: new Date()
        });

        // Generate JWT token
        const token = generateToken({
            userId: user._id.toString(),
            roomId: room._id.toString(),
            roomCode: normalizedCode,
            username
        });

        // Calculate spawn position
        const spawnX = 400 + Math.floor(Math.random() * 50);
        const spawnY = 300 + Math.floor(Math.random() * 50);

        return res.status(200).json({
            success: true,
            token,
            userId: user._id,
            username,
            avatar: user.avatar,
            roomId: room._id,
            roomCode: normalizedCode,
            roomName: room.name,
            isCreator: room.creatorId.toString() === user._id.toString(),
            expiresAt: room.expiresAt,
            spawn: { x: spawnX, y: spawnY }
        });

    } catch (error) {
        console.error('Join room error:', error);
        return res.status(500).json({ error: 'Failed to join room' });
    }
};

/**
 * POST /api/v1/rooms/abolish
 * Delete room (creator only) - kicks all users
 */
export const abolishRoom = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { roomId, userId } = req.user;

        // Find room
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Check if user is creator
        if (room.creatorId.toString() !== userId) {
            return res.status(403).json({ error: 'Only room creator can abolish the room' });
        }

        // Deactivate room
        room.isActive = false;
        await room.save();

        // Clear all users' currentRoomId
        await User.updateMany(
            { currentRoomId: room._id },
            { $set: { currentRoomId: null, lastLogout: new Date() } }
        );

        return res.status(200).json({
            success: true,
            message: 'Room abolished successfully'
        });

    } catch (error) {
        console.error('Abolish room error:', error);
        return res.status(500).json({ error: 'Failed to abolish room' });
    }
};

/**
 * GET /api/v1/rooms/:roomId
 * Get room details
 */
export const getRoomDetails = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { roomId } = req.params;

        const room = await Room.findById(roomId).populate('creatorId', 'username avatar');
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Get users in this room
        const usersInRoom = await User.find({ currentRoomId: room._id }).select('username avatar');

        return res.status(200).json({
            roomId: room._id,
            code: room.code,
            name: room.name,
            creator: room.creatorId,
            createdAt: room.createdAt,
            expiresAt: room.expiresAt,
            isActive: room.isActive,
            users: usersInRoom
        });

    } catch (error) {
        console.error('Get room details error:', error);
        return res.status(500).json({ error: 'Failed to get room details' });
    }
};

/**
 * POST /api/v1/rooms/rejoin
 * Rejoin using existing token (session persistence)
 */
export const rejoinRoom = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { userId, roomId, roomCode } = req.user;

        // Verify room still exists and is active
        const room = await Room.findOne({
            _id: roomId,
            isActive: true,
            expiresAt: { $gt: new Date() }
        });

        if (!room) {
            return res.status(404).json({ error: 'Room no longer exists or has expired' });
        }

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user's last login and current room
        user.lastLogin = new Date();
        user.currentRoomId = room._id;
        await user.save();

        // Calculate spawn position
        const spawnX = 400 + Math.floor(Math.random() * 50);
        const spawnY = 300 + Math.floor(Math.random() * 50);

        return res.status(200).json({
            success: true,
            userId: user._id,
            username: user.username,
            avatar: user.avatar,
            roomId: room._id,
            roomCode: room.code,
            roomName: room.name,
            isCreator: room.creatorId.toString() === userId,
            expiresAt: room.expiresAt,
            spawn: { x: spawnX, y: spawnY }
        });

    } catch (error) {
        console.error('Rejoin room error:', error);
        return res.status(500).json({ error: 'Failed to rejoin room' });
    }
};
