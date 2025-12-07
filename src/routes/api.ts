import { Router } from 'express';
import * as AuthController from '../controllers/authController';
import * as MapController from '../controllers/mapController';

const router = Router();

// Define endpoints
router.post('/login', AuthController.login);
router.get('/map', MapController.getMap);

// Health check
router.get('/health', (req, res) => res.send('Pixel Server OK'));

export default router;
