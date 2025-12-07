import { Router } from 'express';

const router = Router();

// GET /api/room-info
router.get('/room-info', (req, res) => {
    res.json({
        roomName: "V1 Main Office",
        mapUrl: "/maps/main-office.json"
    });
});

export default router;
