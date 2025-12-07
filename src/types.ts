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
