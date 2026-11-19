import { Router } from 'express';
import {
  uploadDocument,
  getMyDocuments,
  getDocumentById,
  deleteDocument,
  getSummary,
  getSuggestedQuestions,
} from '../controllers/documentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

// All document routes require authentication
router.use(requireAuth);

router.post('/upload', upload.single('document'), uploadDocument);
router.get('/', getMyDocuments);
router.get('/:id', getDocumentById);
router.delete('/:id', deleteDocument);
router.get('/:id/summary', getSummary);
router.get('/:id/suggested-questions', getSuggestedQuestions);

export default router;
