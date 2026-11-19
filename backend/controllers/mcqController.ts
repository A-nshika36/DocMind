import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { db, MCQAttemptRecord } from '../models/db.js';
import { generateMCQs } from '../services/aiService.js';

/**
 * Generate new MCQs for a document
 */
export async function generateMCQsForDocument(req: AuthenticatedRequest, res: Response) {
  try {
    const { documentId } = req.params;
    const { count = 5, difficulty = 'medium' } = req.body;
    const userId = req.user!.id;

    const validCounts = [5, 10, 15, 20];
    const validDifficulties = ['easy', 'medium', 'hard'];

    const numCount = Number(count);
    if (!validCounts.includes(numCount)) {
      res.status(400).json({ success: false, message: 'Please select 5, 10, 15, or 20 questions.' });
      return;
    }

    if (!validDifficulties.includes(difficulty)) {
      res.status(400).json({ success: false, message: 'Difficulty must be Easy, Medium, or Hard.' });
      return;
    }

    const doc = db.documents.findByIdAndUser(documentId, userId);
    if (!doc) {
      res.status(404).json({ success: false, message: 'Document not found or unauthorized.' });
      return;
    }

    // Generate fresh questions using AI
    const mcqs = await generateMCQs(
      doc.extracted_text,
      doc.file_name,
      numCount,
      difficulty as 'easy' | 'medium' | 'hard',
      documentId,
      userId
    );

    // Replace previous MCQs for this document/user to have a clean practice set
    db.mcqs.deleteByDocument(documentId, userId);
    db.mcqs.createMany(mcqs);

    // Return questions (without revealing correct answers directly during practice, or with them for instant client review)
    // To allow transparent practice, we return the questions and options
    res.json({
      success: true,
      message: `Generated ${mcqs.length} MCQs successfully.`,
      mcqs,
    });
  } catch (error: any) {
    console.error('MCQ generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong while generating MCQs. Please try again.',
    });
  }
}

/**
 * Get existing MCQs for a document
 */
export async function getDocumentMCQs(req: AuthenticatedRequest, res: Response) {
  try {
    const { documentId } = req.params;
    const userId = req.user!.id;

    const doc = db.documents.findByIdAndUser(documentId, userId);
    if (!doc) {
      res.status(404).json({ success: false, message: 'Document not found or unauthorized.' });
      return;
    }

    const mcqs = db.mcqs
      .findByDocument(documentId, userId)
      .filter((m) => !m.id.startsWith('mcq_fb_'));
    res.json({ success: true, mcqs });
  } catch (error: any) {
    console.error('Fetch MCQs error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve MCQs.' });
  }
}

/**
 * Submit MCQ practice answers and calculate score & explanations
 */
export async function submitMCQAttempt(req: AuthenticatedRequest, res: Response) {
  try {
    const { documentId } = req.params;
    const { answers } = req.body as { answers: Record<string, string> };
    const userId = req.user!.id;

    const doc = db.documents.findByIdAndUser(documentId, userId);
    if (!doc) {
      res.status(404).json({ success: false, message: 'Document not found or unauthorized.' });
      return;
    }

    const mcqs = db.mcqs.findByDocument(documentId, userId);
    if (mcqs.length === 0) {
      res.status(400).json({ success: false, message: 'No MCQs found for this document. Please generate some first.' });
      return;
    }

    let score = 0;
    const detailedAnswers = mcqs.map((mcq) => {
      const selected = answers[mcq.id] || '';
      const isCorrect = selected.toUpperCase() === mcq.correct_answer.toUpperCase();
      if (isCorrect) score += 1;

      return {
        question_id: mcq.id,
        question: mcq.question,
        selected_option: selected,
        correct_option: mcq.correct_answer,
        is_correct: isCorrect,
        explanation: mcq.explanation,
      };
    });

    const attemptRecord: MCQAttemptRecord = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      document_id: documentId,
      score,
      total_questions: mcqs.length,
      difficulty: mcqs[0]?.difficulty || 'medium',
      answers: detailedAnswers,
      attempted_at: new Date().toISOString(),
    };

    db.mcqAttempts.create(attemptRecord);

    res.json({
      success: true,
      result: {
        attemptId: attemptRecord.id,
        score,
        total: mcqs.length,
        percentage: Math.round((score / mcqs.length) * 100),
        breakdown: detailedAnswers,
        attempted_at: attemptRecord.attempted_at,
      },
    });
  } catch (error: any) {
    console.error('Submit MCQ error:', error);
    res.status(500).json({ success: false, message: 'Failed to evaluate MCQ responses.' });
  }
}

/**
 * Get past attempts for a document
 */
export async function getDocumentAttempts(req: AuthenticatedRequest, res: Response) {
  try {
    const { documentId } = req.params;
    const userId = req.user!.id;

    const attempts = db.mcqAttempts.findByDocumentAndUser(documentId, userId);
    res.json({ success: true, attempts });
  } catch (error: any) {
    console.error('Fetch attempts error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve past attempts.' });
  }
}
