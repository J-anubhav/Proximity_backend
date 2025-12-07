import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api';
import { config } from './config/config';

const app = express();

// Middlewares
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Mount Routes
app.use('/api/v1', apiRoutes);

export default app;
