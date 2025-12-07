import { Player, RoomState } from '../types';

class StateManager {
    private state: RoomState = {
        players: {}
    };

    addPlayer(id: string, data: { username: string; role: string }): Player {
        const newPlayer: Player = {
            id,
            username: data.username,
            role: data.role,
            x: 0, // Default start position
            y: 0,
            direction: 'down'
        };
        this.state.players[id] = newPlayer;
        return newPlayer;
    }

    removePlayer(id: string): void {
        delete this.state.players[id];
    }

    updatePlayerPosition(id: string, data: { x: number; y: number; direction: string }): Player | null {
        const player = this.state.players[id];
        if (player) {
            player.x = data.x;
            player.y = data.y;
            player.direction = data.direction;
            return player;
        }
        return null;
    }

    getPlayerById(id: string): Player | undefined {
        return this.state.players[id];
    }

    getAllPlayers(): Record<string, Player> {
        return this.state.players;
    }
}

export const state = new StateManager();
