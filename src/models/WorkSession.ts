import mongoose, { Schema, Document } from 'mongoose';

export type WorkCategory = 'half' | 'full' | 'overtime';

export interface IWorkSession extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    roomId: mongoose.Types.ObjectId;
    loginTime: Date;
    logoutTime: Date | null;
    totalMinutes: number | null;
    category: WorkCategory | null;
}

const WorkSessionSchema = new Schema<IWorkSession>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roomId: {
        type: Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    loginTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    logoutTime: {
        type: Date,
        default: null
    },
    totalMinutes: {
        type: Number,
        default: null
    },
    category: {
        type: String,
        enum: ['half', 'full', 'overtime', null],
        default: null
    }
});

// Index for user session history
WorkSessionSchema.index({ userId: 1, loginTime: -1 });
WorkSessionSchema.index({ roomId: 1, loginTime: -1 });

/**
 * Calculate work category based on login and logout times
 * < 4 hours = half day
 * 4-8 hours = full day
 * > 8 hours = overtime (capped display at 8h + OT)
 */
export function calculateWorkTime(loginTime: Date, logoutTime: Date): {
    totalMinutes: number;
    category: WorkCategory;
    displayText: string;
} {
    const diffMs = logoutTime.getTime() - loginTime.getTime();
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = totalMinutes / 60;

    if (hours < 4) {
        return {
            totalMinutes,
            category: 'half',
            displayText: `${Math.floor(hours)}h ${totalMinutes % 60}m (Half Day)`
        };
    } else if (hours <= 8) {
        return {
            totalMinutes,
            category: 'full',
            displayText: `${Math.floor(hours)}h ${totalMinutes % 60}m (Full Day)`
        };
    } else {
        const overtimeMinutes = totalMinutes - 480; // 8 hours = 480 minutes
        const overtimeHours = Math.floor(overtimeMinutes / 60);
        return {
            totalMinutes,
            category: 'overtime',
            displayText: `8h + ${overtimeHours}h ${overtimeMinutes % 60}m OT`
        };
    }
}

export const WorkSession = mongoose.model<IWorkSession>('WorkSession', WorkSessionSchema);
