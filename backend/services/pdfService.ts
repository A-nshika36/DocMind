import { PDFParse } from 'pdf-parse';
import { cleanExtractedText } from '../utils/textCleaner.js';

export interface ExtractionResult {
  text: string;
  wordCount: number;
  charCount: number;
}

/**
 * Extracts plain text from a PDF Buffer.
 * If the PDF has no selectable text (e.g. scanned image-only PDF),
 * throws a user-friendly error as required:
 * "This PDF does not contain readable text. Please upload a text-based PDF."
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<ExtractionResult> {
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error('The uploaded PDF file is empty.');
  }

  let parser: PDFParse | null = null;
  try {
    parser = new PDFParse({ data: pdfBuffer });
    const textResult = await parser.getText();
    const rawText = textResult.text || '';
    const cleaned = cleanExtractedText(rawText);

    // If after cleaning there is virtually no text, it is likely scanned images
    // or an empty PDF document.
    if (!cleaned || cleaned.replace(/\s/g, '').length < 15) {
      throw new Error('This PDF does not contain readable text. Please upload a text-based PDF.');
    }

    const words = cleaned.split(/\s+/).filter(Boolean);

    return {
      text: cleaned,
      wordCount: words.length,
      charCount: cleaned.length,
    };
  } catch (error: any) {
    if (error.message && error.message.includes('This PDF does not contain readable text')) {
      throw error;
    }
    // If it's a corrupted PDF or invalid format
    if (
      error.name === 'InvalidPDFException' ||
      error.name === 'FormatError' ||
      error.message?.includes('corrupt') ||
      error.message?.includes('Invalid PDF')
    ) {
      throw new Error('The uploaded PDF appears to be corrupted or invalid. Please check the file and try again.');
    }
    throw new Error(`Failed to extract text from PDF: ${error.message || 'Unknown error'}`);
  } finally {
    if (parser) {
      try {
        await parser.destroy();
      } catch {
        // Ignore destroy error
      }
    }
  }
}

/**
 * Extracts and cleans text from a TXT file Buffer.
 */
export function extractTextFromTXT(txtBuffer: Buffer): ExtractionResult {
  if (!txtBuffer || txtBuffer.length === 0) {
    throw new Error('The uploaded TXT file is empty.');
  }

  const rawText = txtBuffer.toString('utf-8');
  const cleaned = cleanExtractedText(rawText);

  if (!cleaned || cleaned.replace(/\s/g, '').length < 5) {
    throw new Error('The uploaded text file does not contain readable content.');
  }

  const words = cleaned.split(/\s+/).filter(Boolean);

  return {
    text: cleaned,
    wordCount: words.length,
    charCount: cleaned.length,
  };
}
