import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { LoginResponse } from '../types';

export const login = async (req: Request, res: Response) => {
    try {
        const { username, avatar } = req.body;

        // VALIDATION
        if (!username || username.length < 2) {
            return res.status(400).json({ error: 'Username too short' });
        }

        // LOGIC: Create a temporary user ID
        const userId = uuidv4();

        // LOGIC: Calculate a random spawn point to avoid stacking
        const spawnX = 400 + Math.floor(Math.random() * 50);
        const spawnY = 300 + Math.floor(Math.random() * 50);

        const response: LoginResponse = {
            userId,
            username,
            avatar: avatar || 'default',
            spawn: { x: spawnX, y: spawnY }
        };

        return res.status(200).json(response);

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Login failed' });
    }
};
