
import { redisClient } from '../config/redis';
import { PlayerState } from '../types';

class StateManager {

    // Key prefix to avoid collisions
    private PLAYER_PREFIX = 'player:';

    async addPlayer(id: string, data: { username: string; avatar?: string }): Promise<PlayerState> {
        const newPlayer: PlayerState = {
            id,
            username: data.username,
            avatar: data.avatar || 'default',
            x: 400,
            y: 300,
            direction: 'down',
            isMoving: false,
            currentRoom: null,
            lastActive: Date.now()
        };

        await redisClient.set(`${this.PLAYER_PREFIX}${id}`, JSON.stringify(newPlayer));
        return newPlayer;
    }

    async removePlayer(id: string): Promise<void> {
        await redisClient.del(`${this.PLAYER_PREFIX}${id}`);
    }

    async updatePlayerPosition(id: string, data: { x: number; y: number; direction: string; currentRoom: string | null }): Promise<PlayerState | null> {
        const player = await this.getPlayerById(id);
        if (player) {
            player.x = data.x;
            player.y = data.y;
            player.direction = data.direction;
            player.currentRoom = data.currentRoom;
            player.isMoving = true;
            player.lastActive = Date.now();

            await redisClient.set(`${this.PLAYER_PREFIX}${id}`, JSON.stringify(player));
            return player;
        }
        return null;
    }

    async getPlayerById(id: string): Promise<PlayerState | undefined> {
        const data = await redisClient.get(`${this.PLAYER_PREFIX}${id}`);
        if (data) {
            return JSON.parse(data) as PlayerState;
        }
        return undefined;
    }

    // Warning: SCAN is better for production, but KEYS is fine for MVP/Small scale
    async getAllPlayers(): Promise<Record<string, PlayerState>> {
        const keys = await redisClient.keys(`${this.PLAYER_PREFIX}*`);
        const players: Record<string, PlayerState> = {};

        if (keys.length === 0) return players;

        // Pipeliend get for performance
        const validKeys = keys.filter(k => k.startsWith(this.PLAYER_PREFIX));
        if (validKeys.length === 0) return players;

        // In node redis v4, mGet returns string[]
        const values = await redisClient.mGet(validKeys);

        values.forEach((val) => {
            if (val) {
                const p = JSON.parse(val) as PlayerState;
                players[p.id] = p;
            }
        });

        return players;
    }
}

export const state = new StateManager();
