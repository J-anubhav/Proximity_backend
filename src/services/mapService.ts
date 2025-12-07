import fs from 'fs';
import path from 'path';
import { MapZone } from '../types';

class MapService {
    private zones: MapZone[] = [];

    constructor() {
        this.loadMap();
    }

    private loadMap() {
        try {
            const mapPath = path.join(__dirname, '../../public/maps/main-office.json');

            if (!fs.existsSync(mapPath)) {
                console.warn('⚠️ MapService: Map file not found at', mapPath);
                return;
            }

            const data = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

            // Look for a specific layer named "Triggers" or "Zones" in Tiled
            const zoneLayer = data.layers.find((l: any) => l.name === 'Zones');

            if (zoneLayer && zoneLayer.objects) {
                this.zones = zoneLayer.objects.map((obj: any) => ({
                    name: obj.name,          // e.g. "MeetingRoom1"
                    type: 'jitsi',           // You can add custom properties in Tiled
                    x: obj.x,
                    y: obj.y,
                    width: obj.width,
                    height: obj.height
                }));
                console.log(`✅ MapService: Loaded ${this.zones.length} zones.`);
            } else {
                console.warn('⚠️ MapService: No "Zones" layer found in map.');
            }
        } catch (e) {
            console.error('❌ MapService: Failed to load map.json', e);
        }
    }

    // The critical function used by Socket Handlers
    public getZone(x: number, y: number): MapZone | null {
        return this.zones.find(z =>
            x >= z.x && x <= z.x + z.width &&
            y >= z.y && y <= z.y + z.height
        ) || null;
    }
}

export const mapService = new MapService();
