import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

export const getMap = (req: Request, res: Response) => {
    try {
        const mapPath = path.join(__dirname, '../../public/maps/main-office.json');

        // Check if file exists
        if (!fs.existsSync(mapPath)) {
            return res.status(404).json({ error: 'Map file missing' });
        }

        // Read the file (Cached reading recommended in production)
        const mapData = fs.readFileSync(mapPath, 'utf-8');

        res.header('Content-Type', 'application/json');
        return res.send(mapData);
    } catch (error) {
        console.error('Map not found:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
