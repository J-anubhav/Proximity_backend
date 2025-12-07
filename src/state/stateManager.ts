import { PlayerState, RoomState } from '../types';

class StateManager {
    private state: RoomState = {
        players: {}
    };

    addPlayer(id: string, data: { username: string; avatar?: string }): PlayerState {
        const newPlayer: PlayerState = {
            id,
            username: data.username,
            avatar: data.avatar || 'default',
            x: 400, // Default start position
            y: 300,
            direction: 'down',
            isMoving: false,
            currentRoom: null,
            lastActive: Date.now()
        };
        this.state.players[id] = newPlayer;
        return newPlayer;
    }

    removePlayer(id: string): void {
        delete this.state.players[id];
    }

    updatePlayerPosition(id: string, data: { x: number; y: number; direction: string }): PlayerState | null {
        const player = this.state.players[id];
        if (player) {
            player.x = data.x;
            player.y = data.y;
            player.direction = data.direction;
            player.isMoving = true; // Assume moving if updating
            player.lastActive = Date.now();
            return player;
        }
        return null;
    }

    getPlayerById(id: string): PlayerState | undefined {
        return this.state.players[id];
    }

    getAllPlayers(): Record<string, PlayerState> {
        return this.state.players;
    }
}

export const state = new StateManager();
