/**
 * DocMind - Text Cleaning & Chunking Utility
 *
 * Cleans extracted text from PDF/TXT files and prepares large-document context
 * cleanly before passing to Gemini AI models.
 */

export function cleanExtractedText(rawText: string): string {
  if (!rawText) return '';

  return (
    rawText
      // Remove null bytes and non-printable control characters (except newlines and tabs)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Replace carriage returns with newlines
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove pdf-parse page marker lines like "-- 1 of 45 --"
      .replace(/^\s*--\s*\d+\s+of\s+\d+\s*--\s*$/gm, '')
      // Remove excessive spaces on each line
      .replace(/[ \t]+/g, ' ')
      // Reduce 3 or more consecutive newlines to 2 newlines (preserve paragraphs)
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

/**
 * Splits text into readable chunks if a document is very large,
 * preserving paragraph/sentence boundaries without risking infinite loops.
 */
export function chunkText(text: string, maxChunkSize = 8000, overlap = 400): string[] {
  if (!text) return [];
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const safeOverlap = Math.min(overlap, Math.floor(maxChunkSize * 0.25));
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + maxChunkSize;

    if (endIndex >= text.length) {
      const tail = text.slice(startIndex).trim();
      if (tail) chunks.push(tail);
      break;
    }

    // Try finding the nearest paragraph break or sentence end
    const lastParagraph = text.lastIndexOf('\n\n', endIndex);
    const lastPeriod = text.lastIndexOf('. ', endIndex);

    if (lastParagraph > startIndex + maxChunkSize * 0.6) {
      endIndex = lastParagraph;
    } else if (lastPeriod > startIndex + maxChunkSize * 0.6) {
      endIndex = lastPeriod + 1;
    }

    const chunk = text.slice(startIndex, endIndex).trim();
    if (chunk) {
      chunks.push(chunk);
    }

    const nextStart = endIndex - safeOverlap;
    startIndex = nextStart > startIndex ? nextStart : endIndex;
  }

  return chunks;
}

/**
 * Prepares document text for whole-document tasks (Summaries, MCQs, Suggested Questions).
 * - Sends the full text when within maxChars (fits easily in gemini-4-hydrogen's context).
 * - For massive multi-hundred-page files (> maxChars), samples evenly across the beginning,
 *   middle sections, and conclusion so the entire document is represented.
 */
export function prepareDocumentContext(
  text: string,
  maxChars = 200000
): { content: string; isSampled: boolean } {
  if (text.length <= maxChars) {
    return { content: text, isSampled: false };
  }

  const sectionCount = 8;
  const sectionBudget = Math.floor(maxChars / sectionCount) - 80;
  const totalLen = text.length;
  const parts: string[] = [];

  for (let i = 0; i < sectionCount; i++) {
    const ratio = i / (sectionCount - 1);
    const maxStart = Math.max(0, totalLen - sectionBudget);
    const start = Math.floor(ratio * maxStart);
    const rawSlice = text.slice(start, start + sectionBudget).trim();
    parts.push(`[Document Section ${i + 1} of ${sectionCount}]\n${rawSlice}`);
  }

  return {
    content: parts.join('\n\n---\n\n'),
    isSampled: true,
  };
}

const QUERY_STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
  'will', 'with', 'what', 'who', 'where', 'when', 'why', 'how', 'which', 'did',
  'does', 'do', 'can', 'could', 'would', 'should', 'about', 'this', 'these', 'those',
  'tell', 'me', 'give', 'explain', 'mention', 'mentioned', 'document', 'file', 'text',
  'name', 'there', 'their', 'they', 'please', 'find', 'show', 'list',
]);

/**
 * Selects full document text if within maxChars, or retrieves the most relevant chunks
 * (plus intro & conclusion) when answering questions on extremely large files.
 */
export function selectRelevantContext(
  text: string,
  question: string,
  maxChars = 160000
): string {
  if (text.length <= maxChars) {
    return text;
  }

  const chunks = chunkText(text, 8000, 400);
  const keywords = question
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !QUERY_STOP_WORDS.has(w));

  const scored = chunks.map((chunk, index) => {
    const lower = chunk.toLowerCase();
    let score = 0;

    for (const kw of keywords) {
      if (lower.includes(kw)) {
        // Count occurrences (capped to prevent one noisy section dominating)
        const matches = lower.split(kw).length - 1;
        score += 3 + Math.min(matches, 5);
      }
    }

    // Always give slight priority to intro (index 0) and conclusion (last index)
    if (index === 0) score += 2;
    if (index === chunks.length - 1) score += 1;

    return { index, chunk, score };
  });

  // Sort by score descending, pick chunks up to maxChars, then re-order chronologically
  const selectedIndices = new Set<number>([0]);
  let usedChars = chunks[0]?.length || 0;

  const byRelevance = [...scored].sort((a, b) => b.score - a.score);
  for (const item of byRelevance) {
    if (selectedIndices.has(item.index)) continue;
    if (usedChars + item.chunk.length + 32 > maxChars) continue;
    selectedIndices.add(item.index);
    usedChars += item.chunk.length + 32;
  }

  return Array.from(selectedIndices)
    .sort((a, b) => a - b)
    .map((idx) => `[Section ${idx + 1}/${chunks.length}]\n${chunks[idx]}`)
    .join('\n\n---\n\n');
}
