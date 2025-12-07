import { Socket, Server } from 'socket.io';
import { state } from '../state/stateManager';
import { mapService } from '../services/mapService';

export const registerPlayerHandlers = (io: Server, socket: Socket) => {
    // Event: join-room
    socket.on('join-room', async (data: { username: string; avatar?: string }) => {
        console.log(`Player joined: ${socket.id} (${data.username})`);

        // 1. ADD Player to Redis
        const newPlayer = await state.addPlayer(socket.id, {
            username: data.username,
            avatar: data.avatar
        });

        // 2. EMIT 'current-users' to THIS socket
        const allPlayers = await state.getAllPlayers();
        socket.emit('current-users', allPlayers);

        // 3. BROADCAST 'new-user-joined' to ALL OTHER sockets
        socket.broadcast.emit('new-user-joined', newPlayer);
    });

    // Event: player-move
    socket.on('player-move', async (data: { x: number; y: number; direction: string }) => {
        // 1. Calculate Zone
        const currentZone = mapService.getZone(data.x, data.y);
        const newRoomName = currentZone ? currentZone.name : null;

        // 2. Get Old State to check for change
        const oldPlayerState = await state.getPlayerById(socket.id);
        const oldRoomName = oldPlayerState?.currentRoom || null;

        // 3. Update Redis
        const updatedPlayer = await state.updatePlayerPosition(socket.id, {
            ...data,
            currentRoom: newRoomName
        });

        if (updatedPlayer) {
            // 4. Zone Change Check (Jitsi Trigger)
            if (newRoomName !== oldRoomName) {
                console.log(`Player ${socket.id} moved: ${oldRoomName} -> ${newRoomName}`);
                socket.emit('room-changed', {
                    entered: newRoomName,
                    left: oldRoomName
                });
            }

            // 5. BROADCAST 'player-moved' to ALL OTHER sockets
            // Optimization: In a real MMO, you'd only broadcast to neighbors.
            socket.broadcast.emit('player-moved', updatedPlayer);
        }
    });
};
