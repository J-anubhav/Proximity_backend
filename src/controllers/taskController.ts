import { Request, Response } from 'express';
import { Task, Room, KANBAN_COLUMNS } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { normalizeRoomCode } from '../utils/roomCode';
import mongoose from 'mongoose';

/**
 * GET /api/v1/rooms/:roomCode/tasks
 * Get all tasks for a room by ROOM CODE
 */
export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { roomCode } = req.params;

        // Normalize code
        const normalizedCode = normalizeRoomCode(roomCode);

        // Find room by code
        const room = await Room.findOne({ code: normalizedCode });
        if (!room || !room.isActive) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Fetch all tasks for the room
        const tasks = await Task.find({ roomId: room._id }).sort({ createdAt: 1 });

        // Group tasks by status for Kanban view
        const kanban = KANBAN_COLUMNS.map(col => ({
            ...col,
            tasks: tasks.filter(t => t.status === col.key)
        }));

        return res.status(200).json({
            roomCode: normalizedCode,
            tasks,
            kanban,
            columns: KANBAN_COLUMNS
        });

    } catch (error) {
        console.error('Get tasks error:', error);
        return res.status(500).json({ error: 'Failed to get tasks' });
    }
};

/**
 * POST /api/v1/rooms/:roomCode/tasks
 * Create a new task by ROOM CODE
 */
export const createTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { roomCode } = req.params;
        const { title, description, status } = req.body;

        // Validation
        if (!title || title.trim().length < 1) {
            return res.status(400).json({ error: 'Task title is required' });
        }

        // Normalize code
        const normalizedCode = normalizeRoomCode(roomCode);

        // Find room by code
        const room = await Room.findOne({ code: normalizedCode });
        if (!room || !room.isActive) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Create task
        const task = await Task.create({
            roomId: room._id,
            title: title.trim(),
            description: description || '',
            status: status || 'todo'
        });

        return res.status(201).json({
            success: true,
            task
        });

    } catch (error) {
        console.error('Create task error:', error);
        return res.status(500).json({ error: 'Failed to create task' });
    }
};

/**
 * PATCH /api/v1/tasks/:taskId
 * Update a task (move between columns, edit title/description)
 */
export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { taskId } = req.params;
        const { title, description, status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ error: 'Invalid task ID' });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Update fields if provided
        if (title !== undefined) task.title = title.trim();
        if (description !== undefined) task.description = description;
        if (status !== undefined) {
            const validStatuses = KANBAN_COLUMNS.map(c => c.key);
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: 'Invalid status' });
            }
            task.status = status;
        }

        await task.save();

        return res.status(200).json({
            success: true,
            task
        });

    } catch (error) {
        console.error('Update task error:', error);
        return res.status(500).json({ error: 'Failed to update task' });
    }
};

/**
 * DELETE /api/v1/tasks/:taskId
 * Delete a task
 */
export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { taskId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ error: 'Invalid task ID' });
        }

        const task = await Task.findByIdAndDelete(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Task deleted',
            taskId
        });

    } catch (error) {
        console.error('Delete task error:', error);
        return res.status(500).json({ error: 'Failed to delete task' });
    }
};
