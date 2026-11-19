import fs from 'fs';
import path from 'path';

/**
 * DocuLearn AI Database Models
 * 
 * Simple, robust, beginner-friendly file-backed database.
 * Stores data safely in `data/db.json` without requiring external MongoDB configuration,
 * while maintaining a collection-based schema design identical to MongoDB / Relational models.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface StructuredSummary {
  overview: string;
  keyPoints: string[];
  importantConcepts: Array<{ term: string; explanation: string }>;
  importantTerms: Array<{ term: string; definition: string }>;
  conclusion: string;
}

export interface DocumentRecord {
  id: string;
  user_id: string;
  file_name: string;
  file_type: 'pdf' | 'txt';
  file_size: number;
  extracted_text: string;
  char_count: number;
  word_count: number;
  summary: StructuredSummary | null;
  suggested_questions: string[];
  uploaded_at: string;
}

export interface QuestionRecord {
  id: string;
  user_id: string;
  document_id: string;
  question: string;
  answer: string;
  created_at: string;
}

export interface MCQRecord {
  id: string;
  document_id: string;
  user_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
}

export interface MCQAttemptRecord {
  id: string;
  user_id: string;
  document_id: string;
  score: number;
  total_questions: number;
  difficulty: string;
  answers: Array<{
    question_id: string;
    question: string;
    selected_option: string;
    correct_option: string;
    is_correct: boolean;
    explanation: string;
  }>;
  attempted_at: string;
}

interface DatabaseSchema {
  users: User[];
  documents: DocumentRecord[];
  questions: QuestionRecord[];
  mcqs: MCQRecord[];
  mcq_attempts: MCQAttemptRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Initial schema
const defaultData: DatabaseSchema = {
  users: [],
  documents: [],
  questions: [],
  mcqs: [],
  mcq_attempts: [],
};

class Database {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        return { ...defaultData, ...JSON.parse(fileContent) };
      }
    } catch (error) {
      console.error('Error loading database, resetting to defaults:', error);
    }
    return { ...defaultData };
  }

  private scheduleSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.flushSync();
    }, 100);
  }

  public flushSync() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // Users collection operations
  public users = {
    find: (predicate?: (user: User) => boolean): User[] => {
      return predicate ? this.data.users.filter(predicate) : [...this.data.users];
    },
    findById: (id: string): User | undefined => {
      return this.data.users.find((u) => u.id === id);
    },
    findByEmail: (email: string): User | undefined => {
      return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    },
    create: (user: User): User => {
      this.data.users.push(user);
      this.scheduleSave();
      return user;
    },
    update: (id: string, updates: Partial<User>): User | null => {
      const idx = this.data.users.findIndex((u) => u.id === id);
      if (idx === -1) return null;
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.scheduleSave();
      return this.data.users[idx];
    },
  };

  // Documents collection operations
  public documents = {
    findByUser: (userId: string): DocumentRecord[] => {
      return this.data.documents.filter((d) => d.user_id === userId);
    },
    findById: (id: string): DocumentRecord | undefined => {
      return this.data.documents.find((d) => d.id === id);
    },
    findByIdAndUser: (id: string, userId: string): DocumentRecord | undefined => {
      return this.data.documents.find((d) => d.id === id && d.user_id === userId);
    },
    create: (doc: DocumentRecord): DocumentRecord => {
      this.data.documents.unshift(doc);
      this.scheduleSave();
      return doc;
    },
    update: (id: string, updates: Partial<DocumentRecord>): DocumentRecord | null => {
      const idx = this.data.documents.findIndex((d) => d.id === id);
      if (idx === -1) return null;
      this.data.documents[idx] = { ...this.data.documents[idx], ...updates };
      this.scheduleSave();
      return this.data.documents[idx];
    },
    delete: (id: string, userId: string): boolean => {
      const initialLength = this.data.documents.length;
      this.data.documents = this.data.documents.filter(
        (d) => !(d.id === id && d.user_id === userId)
      );
      if (this.data.documents.length !== initialLength) {
        // Also cascade delete related questions, mcqs, attempts for this document
        this.data.questions = this.data.questions.filter((q) => q.document_id !== id);
        this.data.mcqs = this.data.mcqs.filter((m) => m.document_id !== id);
        this.data.mcq_attempts = this.data.mcq_attempts.filter((a) => a.document_id !== id);
        this.scheduleSave();
        return true;
      }
      return false;
    },
  };

  // Questions (Q&A history) collection operations
  public questions = {
    findByDocument: (documentId: string, userId: string): QuestionRecord[] => {
      return this.data.questions
        .filter((q) => q.document_id === documentId && q.user_id === userId)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    },
    countByUser: (userId: string): number => {
      return this.data.questions.filter((q) => q.user_id === userId).length;
    },
    create: (record: QuestionRecord): QuestionRecord => {
      this.data.questions.push(record);
      this.scheduleSave();
      return record;
    },
    clearByDocument: (documentId: string, userId: string): void => {
      this.data.questions = this.data.questions.filter(
        (q) => !(q.document_id === documentId && q.user_id === userId)
      );
      this.scheduleSave();
    },
  };

  // MCQs collection operations
  public mcqs = {
    findByDocument: (documentId: string, userId: string, difficulty?: string): MCQRecord[] => {
      return this.data.mcqs.filter((m) => {
        const matchesDoc = m.document_id === documentId && m.user_id === userId;
        return difficulty ? matchesDoc && m.difficulty === difficulty : matchesDoc;
      });
    },
    createMany: (mcqList: MCQRecord[]): MCQRecord[] => {
      this.data.mcqs.push(...mcqList);
      this.scheduleSave();
      return mcqList;
    },
    deleteByDocument: (documentId: string, userId: string): void => {
      this.data.mcqs = this.data.mcqs.filter(
        (m) => !(m.document_id === documentId && m.user_id === userId)
      );
      this.scheduleSave();
    },
  };

  // MCQ Attempts (Scores & History)
  public mcqAttempts = {
    findByUser: (userId: string): MCQAttemptRecord[] => {
      return this.data.mcq_attempts
        .filter((a) => a.user_id === userId)
        .sort((a, b) => new Date(b.attempted_at).getTime() - new Date(a.attempted_at).getTime());
    },
    findByDocumentAndUser: (documentId: string, userId: string): MCQAttemptRecord[] => {
      return this.data.mcq_attempts
        .filter((a) => a.document_id === documentId && a.user_id === userId)
        .sort((a, b) => new Date(b.attempted_at).getTime() - new Date(a.attempted_at).getTime());
    },
    countByUser: (userId: string): number => {
      return this.data.mcq_attempts.filter((a) => a.user_id === userId).length;
    },
    create: (attempt: MCQAttemptRecord): MCQAttemptRecord => {
      this.data.mcq_attempts.unshift(attempt);
      this.scheduleSave();
      return attempt;
    },
  };
}

export const db = new Database();
