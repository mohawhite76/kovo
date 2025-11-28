import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import logger from './config/logger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { generalLimiter } from './middlewares/rateLimiter.js';
import { initializeSocket } from './config/socket.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import tripRoutes from './routes/trips.js';
import bookingRoutes from './routes/bookings.js';
import messageRoutes from './routes/messages.js';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(generalLimiter);
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

app.use(errorHandler);

initializeSocket(server);

server.listen(PORT, () => {
  logger.info(`🚗 Kovo API démarrée sur le port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`CORS origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  logger.info(`WebSocket server initialisé`);
});

export default app;
