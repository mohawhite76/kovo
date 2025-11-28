import express from 'express';
import * as messageController from '../controllers/messageController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { messageValidation, idValidation } from '../utils/validators.js';

const router = express.Router();

router.post('/', authenticateToken, messageValidation, messageController.sendMessage);

router.get('/conversations', authenticateToken, messageController.getConversations);

router.get('/conversation/:userId', authenticateToken, messageController.getConversationWith);

router.patch('/:messageId/read', authenticateToken, idValidation, messageController.markAsRead);

router.delete('/:messageId', authenticateToken, idValidation, messageController.deleteMessage);

export default router;
