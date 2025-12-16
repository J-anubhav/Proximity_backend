import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    username: string;
    avatar: string;
    currentRoomId: mongoose.Types.ObjectId | null;
    lastLogin: Date | null;
    lastLogout: Date | null;
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    avatar: {
        type: String,
        default: 'default'
    },
    currentRoomId: {
        type: Schema.Types.ObjectId,
        ref: 'Room',
        default: null
    },
    lastLogin: {
        type: Date,
        default: null
    },
    lastLogout: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster lookups
UserSchema.index({ currentRoomId: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
