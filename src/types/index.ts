export interface User {
  id: string;
  name: string;
  email: string;
  created_at?: string;
}

export interface StructuredSummary {
  overview: string;
  keyPoints: string[];
  importantConcepts: Array<{ term: string; explanation: string }>;
  importantTerms: Array<{ term: string; definition: string }>;
  conclusion: string;
}

export interface DocumentItem {
  id: string;
  file_name: string;
  file_type: 'pdf' | 'txt';
  file_size: number;
  word_count: number;
  char_count: number;
  has_summary?: boolean;
  has_suggested_questions?: boolean;
  uploaded_at: string;
  summary?: StructuredSummary | null;
  suggested_questions?: string[];
  extracted_text_preview?: string;
}

export interface ChatMessageItem {
  id: string;
  user_id?: string;
  document_id?: string;
  question: string;
  answer: string;
  created_at: string;
}

export interface MCQItem {
  id: string;
  document_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer?: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface MCQAttemptResult {
  attemptId: string;
  score: number;
  total: number;
  percentage: number;
  breakdown: Array<{
    question_id: string;
    question: string;
    selected_option: string;
    correct_option: string;
    is_correct: boolean;
    explanation: string;
  }>;
  attempted_at: string;
}

export interface UserStats {
  documentsCount: number;
  questionsCount: number;
  mcqsAttempted: number;
}
