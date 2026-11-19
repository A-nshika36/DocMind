import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { db, DocumentRecord } from '../models/db.js';
import { extractTextFromPDF, extractTextFromTXT } from '../services/pdfService.js';
import { generateSummary, generateSuggestedQuestions } from '../services/aiService.js';
import path from 'path';

/**
 * Handle document upload (PDF or TXT)
 */
export async function uploadDocument(req: AuthenticatedRequest, res: Response) {
  try {
    const file = req.file;
    const userId = req.user!.id;

    if (!file) {
      res.status(400).json({ success: false, message: 'Please select a file to upload.' });
      return;
    }

    const ext = path.extname(file.originalname).toLowerCase();
    let fileType: 'pdf' | 'txt';

    if (ext === '.pdf') {
      fileType = 'pdf';
    } else if (ext === '.txt') {
      fileType = 'txt';
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported format. Supported formats: PDF, TXT',
      });
      return;
    }

    // Extract text depending on file type
    let extractionResult;
    try {
      if (fileType === 'pdf') {
        extractionResult = await extractTextFromPDF(file.buffer);
      } else {
        extractionResult = extractTextFromTXT(file.buffer);
      }
    } catch (extractErr: any) {
      // Specific beginner-friendly error messages
      return res.status(400).json({
        success: false,
        message: extractErr.message || 'Failed to extract text from document.',
      });
    }

    const newDoc: DocumentRecord = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      file_name: file.originalname,
      file_type: fileType,
      file_size: file.size,
      extracted_text: extractionResult.text,
      char_count: extractionResult.charCount,
      word_count: extractionResult.wordCount,
      summary: null,
      suggested_questions: [],
      uploaded_at: new Date().toISOString(),
    };

    db.documents.create(newDoc);

    res.status(201).json({
      success: true,
      message: 'Document uploaded and processed successfully!',
      document: {
        id: newDoc.id,
        file_name: newDoc.file_name,
        file_type: newDoc.file_type,
        file_size: newDoc.file_size,
        word_count: newDoc.word_count,
        char_count: newDoc.char_count,
        uploaded_at: newDoc.uploaded_at,
      },
    });
  } catch (error: any) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while processing your document. Please try again.',
    });
  }
}

/**
 * Get all documents for the authenticated user
 */
export async function getMyDocuments(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const docs = db.documents.findByUser(userId).map((d) => ({
      id: d.id,
      file_name: d.file_name,
      file_type: d.file_type,
      file_size: d.file_size,
      word_count: d.word_count,
      char_count: d.char_count,
      has_summary: !!d.summary && !isLegacyFallbackSummary(d.summary),
      has_suggested_questions: d.suggested_questions.length > 0,
      uploaded_at: d.uploaded_at,
    }));

    res.json({ success: true, documents: docs });
  } catch (error: any) {
    console.error('Fetch documents error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve documents.' });
  }
}

/**
 * Get single document details
 */
export async function getDocumentById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const doc = db.documents.findByIdAndUser(id, userId);

    if (!doc) {
      res.status(404).json({ success: false, message: 'Document not found or unauthorized.' });
      return;
    }

    res.json({
      success: true,
      document: {
        id: doc.id,
        file_name: doc.file_name,
        file_type: doc.file_type,
        file_size: doc.file_size,
        word_count: doc.word_count,
        char_count: doc.char_count,
        summary: doc.summary && !isLegacyFallbackSummary(doc.summary) ? doc.summary : null,
        suggested_questions: doc.suggested_questions,
        uploaded_at: doc.uploaded_at,
        extracted_text_preview: doc.extracted_text.slice(0, 1000) + (doc.extracted_text.length > 1000 ? '...' : ''),
      },
    });
  } catch (error: any) {
    console.error('Fetch document error:', error);
    res.status(500).json({ success: false, message: 'Failed to load document details.' });
  }
}

/**
 * Delete a document and all related Q&A and MCQs
 */
export async function deleteDocument(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const deleted = db.documents.delete(id, userId);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Document not found or unauthorized.' });
      return;
    }

    res.json({ success: true, message: 'Document deleted successfully.' });
  } catch (error: any) {
    console.error('Delete document error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete document.' });
  }
}

function isLegacyFallbackSummary(summary: DocumentRecord['summary']): boolean {
  if (!summary) return false;
  return (
    summary.conclusion?.startsWith('Conclusion and synthesis based on ') ||
    summary.importantConcepts?.some((c) => c.explanation?.startsWith('Identified topic from document:'))
  );
}

/**
 * Generate or retrieve AI Summary for a document
 */
export async function getSummary(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const doc = db.documents.findByIdAndUser(id, userId);

    if (!doc) {
      res.status(404).json({ success: false, message: 'Document not found or unauthorized.' });
      return;
    }

    // Return existing summary if valid and not forced to regenerate
    if (doc.summary && !isLegacyFallbackSummary(doc.summary) && req.query.regenerate !== 'true') {
      res.json({ success: true, summary: doc.summary, cached: true });
      return;
    }

    const summary = await generateSummary(doc.extracted_text, doc.file_name);
    db.documents.update(id, { summary });

    res.json({ success: true, summary, cached: false });
  } catch (error: any) {
    console.error('Summary generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong while generating your summary. Please try again.',
    });
  }
}

/**
 * Generate or retrieve automatic suggested questions for a document
 */
export async function getSuggestedQuestions(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const doc = db.documents.findByIdAndUser(id, userId);

    if (!doc) {
      res.status(404).json({ success: false, message: 'Document not found or unauthorized.' });
      return;
    }

    if (doc.suggested_questions.length > 0 && req.query.regenerate !== 'true') {
      res.json({ success: true, questions: doc.suggested_questions, cached: true });
      return;
    }

    const questions = await generateSuggestedQuestions(doc.extracted_text, doc.file_name);
    db.documents.update(id, { suggested_questions: questions });

    res.json({ success: true, questions, cached: false });
  } catch (error: any) {
    console.error('Suggested questions generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong while generating suggested questions. Please try again.',
    });
  }
}
