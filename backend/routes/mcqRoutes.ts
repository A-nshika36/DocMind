import { Router } from 'express';
import {
  generateMCQsForDocument,
  getDocumentMCQs,
  submitMCQAttempt,
  getDocumentAttempts,
} from '../controllers/mcqController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.post('/generate/:documentId', generateMCQsForDocument);
router.get('/:documentId', getDocumentMCQs);
router.post('/submit/:documentId', submitMCQAttempt);
router.get('/attempts/:documentId', getDocumentAttempts);

export default router;
