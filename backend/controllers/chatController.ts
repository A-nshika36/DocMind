import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { db, QuestionRecord } from '../models/db.js';
import { answerQuestion } from '../services/aiService.js';

/**
 * Get question and answer history for a specific document
 */
export async function getDocumentChatHistory(req: AuthenticatedRequest, res: Response) {
  try {
    const { documentId } = req.params;
    const userId = req.user!.id;

    // Verify document exists and belongs to user
    const doc = db.documents.findByIdAndUser(documentId, userId);
    if (!doc) {
      res.status(404).json({ success: false, message: 'Document not found or unauthorized.' });
      return;
    }

    const history = db.questions.findByDocument(documentId, userId);
    res.json({ success: true, history });
  } catch (error: any) {
    console.error('Fetch chat history error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve chat history.' });
  }
}

/**
 * Ask a question grounded strictly in the selected document
 */
export async function askDocumentQuestion(req: AuthenticatedRequest, res: Response) {
  try {
    const { documentId } = req.params;
    const { question } = req.body;
    const userId = req.user!.id;

    if (!question || !question.trim()) {
      res.status(400).json({ success: false, message: 'Question cannot be empty.' });
      return;
    }

    const doc = db.documents.findByIdAndUser(documentId, userId);
    if (!doc) {
      res.status(404).json({ success: false, message: 'Document not found or unauthorized.' });
      return;
    }

    // Get recent chat context
    const previous = db.questions.findByDocument(documentId, userId).slice(-3);
    const history = previous.flatMap((p) => [
      { role: 'user' as const, text: p.question },
      { role: 'assistant' as const, text: p.answer },
    ]);

    // Generate grounded answer
    const answer = await answerQuestion(doc.extracted_text, doc.file_name, question.trim(), history);

    const questionRecord: QuestionRecord = {
      id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      document_id: documentId,
      question: question.trim(),
      answer,
      created_at: new Date().toISOString(),
    };

    db.questions.create(questionRecord);

    res.json({
      success: true,
      record: questionRecord,
    });
  } catch (error: any) {
    console.error('Ask question error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong while processing your question. Please try again.',
    });
  }
}

/**
 * Clear chat history for a document
 */
export async function clearDocumentChat(req: AuthenticatedRequest, res: Response) {
  try {
    const { documentId } = req.params;
    const userId = req.user!.id;

    const doc = db.documents.findByIdAndUser(documentId, userId);
    if (!doc) {
      res.status(404).json({ success: false, message: 'Document not found or unauthorized.' });
      return;
    }

    db.questions.clearByDocument(documentId, userId);
    res.json({ success: true, message: 'Chat history cleared successfully.' });
  } catch (error: any) {
    console.error('Clear chat error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear chat history.' });
  }
}
