import { Router } from 'express';
import * as AuthController from '../controllers/authController';
import * as MapController from '../controllers/mapController';
import * as RoomController from '../controllers/roomController';
import * as TaskController from '../controllers/taskController';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';

const router = Router();

// Health check
router.get('/health', (req, res) => res.send('Pixel Server OK'));

// Auth (legacy - kept for backward compatibility)
router.post('/login', AuthController.login);

// Logout with work time calculation
router.post('/logout', authMiddleware, RoomController.logout);

// Map
router.get('/map', MapController.getMap);

// ============ Room Management ============
// Create new room (no auth required - creates new user)
// NOTE: One room per user - will fail if user already has active room
router.post('/rooms/create', RoomController.createRoom);

// Join existing room by code (no auth required - creates new user)
router.post('/rooms/join', RoomController.joinRoom);

// Rejoin room using token (auth required)
router.post('/rooms/rejoin', authMiddleware, RoomController.rejoinRoom);

// Abolish room - creator only (auth required)
router.post('/rooms/abolish', authMiddleware, RoomController.abolishRoom);

// Get room details by ROOM CODE (not MongoDB ID)
router.get('/rooms/:roomCode', optionalAuthMiddleware, RoomController.getRoomDetails);

// ============ Kanban Tasks ============
// Get all tasks for a room (by room code)
router.get('/rooms/:roomCode/tasks', optionalAuthMiddleware, TaskController.getTasks);

// Create a new task (by room code)
router.post('/rooms/:roomCode/tasks', authMiddleware, TaskController.createTask);

// Update a task (move columns, edit)
router.patch('/tasks/:taskId', authMiddleware, TaskController.updateTask);

// Delete a task
router.delete('/tasks/:taskId', authMiddleware, TaskController.deleteTask);

export default router;

