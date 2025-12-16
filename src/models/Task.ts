import mongoose, { Schema, Document } from 'mongoose';

export type TaskStatus = 'todo' | 'inprogress' | 'alpha' | 'beta' | 'prod';

export interface ITask extends Document {
    _id: mongoose.Types.ObjectId;
    roomId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    status: TaskStatus;
    createdAt: Date;
    updatedAt: Date;
}

const TaskSchema = new Schema<ITask>({
    roomId: {
        type: Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    description: {
        type: String,
        default: '',
        maxlength: 2000
    },
    status: {
        type: String,
        enum: ['todo', 'inprogress', 'alpha', 'beta', 'prod'],
        default: 'todo'
    }
}, {
    timestamps: true // Auto-manages createdAt and updatedAt
});

// Index for fetching tasks by room
TaskSchema.index({ roomId: 1, status: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);

// Column definitions for frontend reference
export const KANBAN_COLUMNS = [
    { key: 'todo', label: 'To Do' },
    { key: 'inprogress', label: 'In Progress' },
    { key: 'alpha', label: 'Alpha Testing' },
    { key: 'beta', label: 'Beta Testing' },
    { key: 'prod', label: 'Prod (Done)' }
] as const;

