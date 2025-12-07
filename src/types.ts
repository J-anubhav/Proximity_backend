export interface Player {
    id: string;
    username: string;
    role: string;
    x: number;
    y: number;
    direction: string;
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
    players: Record<string, Player>;
}
