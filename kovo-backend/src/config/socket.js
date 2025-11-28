import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from './logger.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      logger.error('Socket authentication failed', { error: error.message });
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info('User connected to WebSocket', { userId: socket.userId, socketId: socket.id });

    socket.join(`user:${socket.userId}`);

    socket.on('join_conversation', (otherUserId) => {
      const roomId = [socket.userId, otherUserId].sort().join(':');
      socket.join(roomId);
      logger.debug('User joined conversation room', { userId: socket.userId, roomId });
    });

    socket.on('leave_conversation', (otherUserId) => {
      const roomId = [socket.userId, otherUserId].sort().join(':');
      socket.leave(roomId);
      logger.debug('User left conversation room', { userId: socket.userId, roomId });
    });

    socket.on('typing_start', (otherUserId) => {
      socket.to(`user:${otherUserId}`).emit('user_typing', { userId: socket.userId, isTyping: true });
    });

    socket.on('typing_stop', (otherUserId) => {
      socket.to(`user:${otherUserId}`).emit('user_typing', { userId: socket.userId, isTyping: false });
    });

    socket.on('disconnect', () => {
      logger.info('User disconnected from WebSocket', { userId: socket.userId, socketId: socket.id });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
    logger.debug('Event emitted to user', { userId, event });
  }
};

export const emitToConversation = (userId1, userId2, event, data) => {
  if (io) {
    const roomId = [userId1, userId2].sort().join(':');
    io.to(roomId).emit(event, data);
    logger.debug('Event emitted to conversation', { roomId, event });
  }
};
