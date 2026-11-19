import { Router } from 'express';
import {
  getDocumentChatHistory,
  askDocumentQuestion,
  clearDocumentChat,
} from '../controllers/chatController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/:documentId', getDocumentChatHistory);
router.post('/:documentId', askDocumentQuestion);
router.delete('/:documentId', clearDocumentChat);

export default router;
