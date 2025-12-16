import { Socket, Server } from 'socket.io';
import { Task, KANBAN_COLUMNS, TaskStatus } from '../models';
import mongoose from 'mongoose';

export const registerKanbanHandlers = (io: Server, socket: Socket) => {

    /**
     * Event: task-create
     * Create a new task and broadcast to room
     */
    socket.on('task-create', async (data: {
        roomCode: string;
        title: string;
        description?: string;
    }) => {
        try {
            const { roomCode, title, description } = data;

            if (!title || title.trim().length < 1) {
                socket.emit('error', { message: 'Task title is required' });
                return;
            }

            // Get roomId from socket data
            const roomId = (socket as any).roomId;
            if (!roomId) {
                socket.emit('error', { message: 'Not in a room' });
                return;
            }

            const task = await Task.create({
                roomId,
                title: title.trim(),
                description: description || '',
                status: 'todo'
            });

            // Broadcast to all in room
            io.to(roomCode.toUpperCase()).emit('task-created', {
                task,
                notification: {
                    type: 'task',
                    message: `New task created: ${task.title}`
                }
            });

            console.log(`Task created in room ${roomCode}: ${task.title}`);
        } catch (error) {
            console.error('Task create error:', error);
            socket.emit('error', { message: 'Failed to create task' });
        }
    });

    /**
     * Event: task-update
     * Update task (move columns, edit) and broadcast to room
     */
    socket.on('task-update', async (data: {
        roomCode: string;
        taskId: string;
        title?: string;
        description?: string;
        status?: TaskStatus;
    }) => {
        try {
            const { roomCode, taskId, title, description, status } = data;

            if (!mongoose.Types.ObjectId.isValid(taskId)) {
                socket.emit('error', { message: 'Invalid task ID' });
                return;
            }

            const task = await Task.findById(taskId);
            if (!task) {
                socket.emit('error', { message: 'Task not found' });
                return;
            }

            const oldStatus = task.status;

            // Update fields if provided
            if (title !== undefined) task.title = title.trim();
            if (description !== undefined) task.description = description;
            if (status !== undefined) {
                const validStatuses = KANBAN_COLUMNS.map(c => c.key);
                if (!validStatuses.includes(status)) {
                    socket.emit('error', { message: 'Invalid status' });
                    return;
                }
                task.status = status;
            }

            await task.save();

            // Determine notification message
            let notificationMessage = `Task "${task.title}" updated`;
            if (status && status !== oldStatus) {
                const oldCol = KANBAN_COLUMNS.find(c => c.key === oldStatus);
                const newCol = KANBAN_COLUMNS.find(c => c.key === status);
                notificationMessage = `Task moved: "${task.title}" (${oldCol?.label} → ${newCol?.label})`;
            }

            // Broadcast to all in room
            io.to(roomCode.toUpperCase()).emit('task-updated', {
                task,
                notification: {
                    type: 'task',
                    message: notificationMessage
                }
            });

            console.log(`Task updated in room ${roomCode}: ${task.title}`);
        } catch (error) {
            console.error('Task update error:', error);
            socket.emit('error', { message: 'Failed to update task' });
        }
    });

    /**
     * Event: task-delete
     * Delete a task and broadcast to room
     */
    socket.on('task-delete', async (data: {
        roomCode: string;
        taskId: string;
    }) => {
        try {
            const { roomCode, taskId } = data;

            if (!mongoose.Types.ObjectId.isValid(taskId)) {
                socket.emit('error', { message: 'Invalid task ID' });
                return;
            }

            const task = await Task.findByIdAndDelete(taskId);
            if (!task) {
                socket.emit('error', { message: 'Task not found' });
                return;
            }

            // Broadcast to all in room
            io.to(roomCode.toUpperCase()).emit('task-deleted', {
                taskId,
                notification: {
                    type: 'task',
                    message: `Task deleted: "${task.title}"`
                }
            });

            console.log(`Task deleted in room ${roomCode}: ${task.title}`);
        } catch (error) {
            console.error('Task delete error:', error);
            socket.emit('error', { message: 'Failed to delete task' });
        }
    });
};
