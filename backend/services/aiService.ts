import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { StructuredSummary, MCQRecord } from '../models/db.js';
import { prepareDocumentContext, selectRelevantContext } from '../utils/textCleaner.js';

/**
 * DocMind - AI Service
 *
 * Uses Google Gemini (`gemini-4-hydrogen` with automatic fast failover to
 * `gemini-3.1-flash-lite` on rate-limit/503 responses) and smart large-document
 * context preparation to generate:
 * 1. Structured Document Summaries
 * 2. Strict Document-Grounded Question Answering
 * 3. Automatic Suggested Study Questions
 * 4. Practice MCQs strictly grounded in the uploaded document/project
 */

const PRIMARY_MODEL = 'gemini-4-hydrogen';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';

// Cache when primary model hits a daily quota cap so we fail over immediately
let primaryCooldownUntil = 0;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured on the server.');
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatGeminiError(error: any): Error {
  const msg = String(error?.message || error || '');
  const status = error?.status;

  if (status === 400 && msg.toLowerCase().includes('api_key')) {
    return new Error('Invalid Gemini API key. Please check Settings > Secrets and try again.');
  }
  if (status === 403 || msg.includes('PERMISSION_DENIED')) {
    return new Error('Gemini API permission denied. Please verify your API key in Settings > Secrets.');
  }
  if (status === 429 || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota exceeded')) {
    return new Error('AI service is temporarily busy (rate limit reached). Please wait a moment and try again.');
  }
  if (status === 404 || msg.includes('NOT_FOUND')) {
    return new Error('The configured AI model is unavailable right now. Please try again shortly.');
  }

  return new Error(msg || 'Failed to get a response from the AI service. Please try again.');
}

function isFailoverError(error: any): boolean {
  const msg = String(error?.message || '');
  const status = error?.status;
  return (
    status === 429 ||
    status === 503 ||
    status === 404 ||
    msg.includes('429') ||
    msg.includes('503') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('Quota exceeded') ||
    msg.includes('UNAVAILABLE')
  );
}

/**
 * Calls Gemini generateContent using PRIMARY_MODEL, with instant failover to
 * FALLBACK_MODEL on 429/503 and short backoff retry if needed.
 */
async function callGemini(baseParams: {
  contents: string;
  config?: Record<string, any>;
}) {
  const ai = getClient();
  const now = Date.now();
  const usePrimaryFirst = now >= primaryCooldownUntil;
  const modelsToTry = usePrimaryFirst
    ? [PRIMARY_MODEL, FALLBACK_MODEL]
    : [FALLBACK_MODEL, PRIMARY_MODEL];

  let lastError: any = null;

  for (const model of modelsToTry) {
    const thinkingLevel =
      model === FALLBACK_MODEL ? ThinkingLevel.MINIMAL : ThinkingLevel.LOW;

    for (let attempt = 0; attempt <= 1; attempt++) {
      try {
        return await ai.models.generateContent({
          model,
          contents: baseParams.contents,
          config: {
            ...(baseParams.config || {}),
            thinkingConfig: { thinkingLevel },
          },
        });
      } catch (error: any) {
        lastError = error;
        const msg = String(error?.message || '');
        const isDailyQuota =
          msg.includes('PerDay') || msg.includes('GenerateRequestsPerDay');

        if (model === PRIMARY_MODEL && isDailyQuota) {
          primaryCooldownUntil = Date.now() + 60 * 60 * 1000;
          console.warn('[AI Service] Primary model daily quota reached; switching to fast fallback model.');
          break;
        }

        if (isFailoverError(error)) {
          if (model === PRIMARY_MODEL) {
            console.warn(`[AI Service] ${model} busy (${error?.status || 'rate/503'}); failing over to ${FALLBACK_MODEL}.`);
            break;
          }
          if (attempt === 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
          }
        }

        throw formatGeminiError(error);
      }
    }
  }

  throw formatGeminiError(lastError);
}

function cleanJsonResponse(raw: string | undefined, fallback: string): string {
  const trimmed = (raw || fallback).trim();
  return trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

/**
 * Generates a structured summary covering the full uploaded document.
 */
export async function generateSummary(documentText: string, fileName: string): Promise<StructuredSummary> {
  const { content, isSampled } = prepareDocumentContext(documentText, 100000);

  const prompt = `You are an expert academic tutor for DocMind.
Analyze the following document strictly based ONLY on the provided text.
Do not assume or bring in external knowledge.
${isSampled ? 'Note: Because this is a very large document, representative sections from across the entire document (beginning, middle, and end) are provided below. Synthesize all of them cohesively.' : ''}

Document Name: "${fileName}"
Document Content:
"""
${content}
"""

Provide a clear, thorough, well-structured summary formatted as JSON with these exact keys:
1. "overview": A concise 3-5 sentence explanation of the document's main topic, scope, and purpose.
2. "keyPoints": An array of 6 to 10 concrete, informative takeaway bullet strings covering all major parts of the document.
3. "importantConcepts": An array of 4 to 8 objects with "term" and "explanation" explaining core concepts or modules from the document clearly.
4. "importantTerms": An array of 4 to 8 objects with "term" and "definition" detailing key terminology, tools, or names used in the document.
5. "conclusion": A clear concluding synthesis of the material.`;

  const response = await callGemini({
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overview: { type: Type.STRING },
          keyPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          importantConcepts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ['term', 'explanation'],
            },
          },
          importantTerms: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                definition: { type: Type.STRING },
              },
              required: ['term', 'definition'],
            },
          },
          conclusion: { type: Type.STRING },
        },
        required: ['overview', 'keyPoints', 'importantConcepts', 'importantTerms', 'conclusion'],
      },
    },
  });

  const rawJson = cleanJsonResponse(response.text, '{}');
  const parsed = JSON.parse(rawJson);

  return {
    overview: parsed.overview || 'Overview unavailable.',
    keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
    importantConcepts: Array.isArray(parsed.importantConcepts) ? parsed.importantConcepts : [],
    importantTerms: Array.isArray(parsed.importantTerms) ? parsed.importantTerms : [],
    conclusion: parsed.conclusion || 'Conclusion unavailable.',
  };
}

/**
 * Answers questions strictly grounded in the document content.
 */
export async function answerQuestion(
  documentText: string,
  fileName: string,
  question: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; text: string }> = []
): Promise<string> {
  const contextText = selectRelevantContext(documentText, question, 80000);

  const historyText = conversationHistory
    .slice(-4)
    .map((h) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`)
    .join('\n');

  const systemInstruction = `You are DocMind AI, a fast, precise academic assistant.
CRITICAL INSTRUCTIONS:
1. Answer the user's question based ONLY on the provided document text below.
2. Do NOT make up or hallucinate facts that are not present in the uploaded document.
3. If the answer truly cannot be found anywhere in the provided document text, respond with:
"I couldn't find this information in the uploaded document."
4. Keep your answer clear, direct, student-friendly, and well-structured.`;

  const prompt = `DOCUMENT NAME: ${fileName}

DOCUMENT CONTENT:
"""
${contextText}
"""

RECENT CONVERSATION CONTEXT:
${historyText || 'None'}

USER'S QUESTION:
${question}

Answer directly and concisely based ONLY on the document:`;

  const response = await callGemini({
    contents: prompt,
    config: {
      systemInstruction,
    },
  });

  const answer = response.text?.trim();
  if (!answer) {
    return "I couldn't find this information in the uploaded document.";
  }

  return answer;
}

/**
 * Automatically generates 6 to 10 relevant study questions based on the document.
 */
export async function generateSuggestedQuestions(
  documentText: string,
  fileName: string
): Promise<string[]> {
  const { content } = prepareDocumentContext(documentText, 80000);

  const prompt = `You are DocMind AI.
Based ONLY on the uploaded document "${fileName}", generate 8 insightful, specific study questions that a student should ask to thoroughly understand the material across the entire document.
Every question must be specific to the actual topics/projects/concepts inside this document and answerable using only this document.

DOCUMENT CONTENT:
"""
${content}
"""

Return a JSON array of strings containing the questions.`;

  const response = await callGemini({
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
      },
    },
  });

  const parsed = JSON.parse(cleanJsonResponse(response.text, '[]'));
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Could not generate suggested questions for this document. Please try again.');
  }

  return parsed.slice(0, 10);
}

/**
 * Generates Multiple Choice Questions (MCQs) strictly grounded in the document/project.
 */
export async function generateMCQs(
  documentText: string,
  fileName: string,
  count: number,
  difficulty: 'easy' | 'medium' | 'hard',
  documentId: string,
  userId: string
): Promise<MCQRecord[]> {
  const { content, isSampled } = prepareDocumentContext(documentText, 100000);

  const difficultyGuidance =
    difficulty === 'easy'
      ? 'Focus on core definitions, direct facts, components, and stated purposes from the document.'
      : difficulty === 'medium'
        ? 'Focus on understanding relationships, workflows, architecture, and how concepts work in the document.'
        : 'Focus on deeper analytical questions, comparisons, edge cases, design rationale, and multi-part details from the document.';

  const prompt = `You are DocMind AI's exam question generator.
Generate exactly ${count} high-quality, document-specific multiple choice questions (MCQs) of ${difficulty} difficulty based STRICTLY on the content of "${fileName}".
${isSampled ? 'Distribute the questions across the different sections provided so the entire document is covered.' : ''}

STRICT QUALITY RULES:
1. Every question MUST test real subject matter, architecture, features, findings, or concepts described in "${fileName}" — NEVER generate generic placeholder questions or options like "Information unrelated to this document".
2. ${difficultyGuidance}
3. Provide 4 distinct, realistic, plausible options (A, B, C, D) written in a consistent style and similar length so the right answer is not obvious by formatting.
4. Exactly ONE option must be unambiguously correct according to the document.
5. Vary the "correct_answer" evenly across "A", "B", "C", and "D" (do NOT make every answer "A").
6. The "explanation" must briefly cite the exact fact or section from the document that proves why the correct option is right.

DOCUMENT NAME: "${fileName}"
DOCUMENT CONTENT:
"""
${content}
"""

Return a JSON array of exactly ${count} objects.`;

  const response = await callGemini({
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            option_a: { type: Type.STRING },
            option_b: { type: Type.STRING },
            option_c: { type: Type.STRING },
            option_d: { type: Type.STRING },
            correct_answer: {
              type: Type.STRING,
              description: 'Must be exactly A, B, C, or D',
            },
            explanation: { type: Type.STRING },
          },
          required: [
            'question',
            'option_a',
            'option_b',
            'option_c',
            'option_d',
            'correct_answer',
            'explanation',
          ],
        },
      },
    },
  });

  const rawJson = cleanJsonResponse(response.text, '[]');
  const parsed = JSON.parse(rawJson);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Could not generate MCQs from this document. Please try again.');
  }

  return parsed.slice(0, count).map((item, index) => {
    let correct = String(item.correct_answer || 'A').toUpperCase().trim();
    if (!['A', 'B', 'C', 'D'].includes(correct)) {
      correct = 'A';
    }

    return {
      id: `mcq_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`,
      document_id: documentId,
      user_id: userId,
      question: item.question || `Question ${index + 1}`,
      option_a: item.option_a || 'Option A',
      option_b: item.option_b || 'Option B',
      option_c: item.option_c || 'Option C',
      option_d: item.option_d || 'Option D',
      correct_answer: correct as 'A' | 'B' | 'C' | 'D',
      explanation: item.explanation || 'Based on the document text.',
      difficulty,
      created_at: new Date().toISOString(),
    };
  });
}
