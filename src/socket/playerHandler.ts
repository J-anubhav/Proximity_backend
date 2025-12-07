import { Socket, Server } from 'socket.io';
import { state } from '../state/stateManager';

export const registerPlayerHandlers = (io: Server, socket: Socket) => {
    // Event: join-room
    socket.on('join-room', (data: { username: string; avatar?: string }) => {
        console.log(`Player joined: ${socket.id} (${data.username})`);

        // 1. ADD Player to state
        const newPlayer = state.addPlayer(socket.id, {
            username: data.username,
            avatar: data.avatar
        });

        // 2. EMIT 'current-users' to THIS socket
        socket.emit('current-users', state.getAllPlayers());

        // 3. BROADCAST 'new-user-joined' to ALL OTHER sockets
        socket.broadcast.emit('new-user-joined', newPlayer);
    });

    // Event: player-move
    socket.on('player-move', (data: { x: number; y: number; direction: string }) => {
        // 1. UPDATE Player position in state
        const updatedPlayer = state.updatePlayerPosition(socket.id, data);

        if (updatedPlayer) {
            // 2. BROADCAST 'player-moved' to ALL OTHER sockets
            socket.broadcast.emit('player-moved', updatedPlayer);
        }
    });
};
