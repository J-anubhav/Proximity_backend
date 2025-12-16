import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
    _id: mongoose.Types.ObjectId;
    code: string;           // 6-char alphanumeric, stored uppercase
    name: string;
    creatorId: mongoose.Types.ObjectId;
    createdAt: Date;
    expiresAt: Date;        // 24 hours from creation
    isActive: boolean;
}

const RoomSchema = new Schema<IRoom>({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,    // Always store as uppercase (case-insensitive)
        minlength: 6,
        maxlength: 6
    },
    name: {
        type: String,
        required: true,
        maxlength: 100
    },
    creatorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

// Index for code lookups and active room queries
RoomSchema.index({ code: 1 });
RoomSchema.index({ isActive: 1, expiresAt: 1 });
RoomSchema.index({ creatorId: 1 });

// TTL index to auto-delete expired rooms (optional, for cleanup)
// RoomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Room = mongoose.model<IRoom>('Room', RoomSchema);
