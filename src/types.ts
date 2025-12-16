export interface PlayerState {
    id: string;          // uuid or socket.id
    username: string;
    avatar?: string;
    x: number;
    y: number;
    direction: string;   // 'left', 'right', 'up', 'down'
    isMoving: boolean;
    currentRoom: string | null; // e.g., 'meeting-room-1' or null
    lastActive: number;  // timestamp for timeout cleanup
}

export interface MapZone {
    name: string;        // 'meeting-room-1'
    type: 'jitsi' | 'entrance';
    x: number;           // Top-left X
    y: number;           // Top-left Y
    width: number;
    height: number;
}

export interface LoginResponse {
    userId: string;
    username: string;
    avatar: string;
    spawn: { x: number; y: number };
    mapConfig?: any;
}

export interface ChatMessage {
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    timestamp: number;
    type: 'global' | 'private';
    targetId?: string;
}

export interface WebRTCSignal {
    signal: any;
    targetSocketId: string;
}

export interface RoomState {
    players: Record<string, PlayerState>;
}

// ============ New Types for Room/Kanban System ============

export type TaskStatus = 'todo' | 'inprogress' | 'alpha' | 'beta' | 'prod';

export type WorkCategory = 'half' | 'full' | 'overtime';

export interface RoomResponse {
    success: boolean;
    token?: string;
    userId: string;
    username: string;
    avatar: string;
    roomId: string;
    roomCode: string;
    roomName: string;
    isCreator: boolean;
    expiresAt: Date;
    spawn: { x: number; y: number };
}

export interface TaskData {
    _id: string;
    roomId: string;
    title: string;
    description: string;
    status: TaskStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface ToastNotification {
    type: 'user' | 'task' | 'room';
    message: string;
}

export interface UserJoinedPayload {
    id: string;
    username: string;
    avatar: string;
    notification: ToastNotification;
}

export interface UserLeftPayload {
    socketId: string;
    username: string;
    workTime: string;
    notification: ToastNotification;
}

export interface TaskEventPayload {
    task?: TaskData;
    taskId?: string;
    notification: ToastNotification;
}

