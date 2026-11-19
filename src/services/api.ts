import {
  User,
  DocumentItem,
  StructuredSummary,
  ChatMessageItem,
  MCQItem,
  MCQAttemptResult,
  UserStats,
} from '../types/index.js';

const TOKEN_KEY = 'doculearn_ai_token';
const USER_KEY = 'doculearn_ai_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser(): User | null {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set application/json only if body is not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: 'Invalid server response.',
  }));

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAuth();
    }
    throw new Error(data.message || 'Request failed. Please try again.');
  }

  return data;
}

// Authentication APIs
export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  return request<{ success: boolean; message: string; user: User }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: { email: string; password: string }) {
  return request<{ success: boolean; message: string; token: string; user: User }>(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function getUserProfile() {
  return request<{ success: boolean; user: User; stats: UserStats }>('/api/auth/profile');
}

// Documents APIs
export async function uploadDocumentFile(file: File) {
  const formData = new FormData();
  formData.append('document', file);

  return request<{
    success: boolean;
    message: string;
    document: DocumentItem;
  }>('/api/documents/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function fetchMyDocuments() {
  return request<{ success: boolean; documents: DocumentItem[] }>('/api/documents');
}

export async function fetchDocumentById(id: string) {
  return request<{ success: boolean; document: DocumentItem }>(`/api/documents/${id}`);
}

export async function deleteDocumentById(id: string) {
  return request<{ success: boolean; message: string }>(`/api/documents/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchDocumentSummary(id: string, regenerate = false) {
  return request<{
    success: boolean;
    summary: StructuredSummary;
    cached: boolean;
  }>(`/api/documents/${id}/summary${regenerate ? '?regenerate=true' : ''}`);
}

export async function fetchSuggestedQuestions(id: string, regenerate = false) {
  return request<{
    success: boolean;
    questions: string[];
    cached: boolean;
  }>(`/api/documents/${id}/suggested-questions${regenerate ? '?regenerate=true' : ''}`);
}

// Chat / Q&A APIs
export async function fetchChatHistory(documentId: string) {
  return request<{ success: boolean; history: ChatMessageItem[] }>(
    `/api/chat/${documentId}`
  );
}

export async function askQuestionApi(documentId: string, question: string) {
  return request<{ success: boolean; record: ChatMessageItem }>(
    `/api/chat/${documentId}`,
    {
      method: 'POST',
      body: JSON.stringify({ question }),
    }
  );
}

export async function clearChatApi(documentId: string) {
  return request<{ success: boolean; message: string }>(`/api/chat/${documentId}`, {
    method: 'DELETE',
  });
}

// MCQ APIs
export async function generateMCQsApi(
  documentId: string,
  count: number,
  difficulty: 'easy' | 'medium' | 'hard'
) {
  return request<{ success: boolean; message: string; mcqs: MCQItem[] }>(
    `/api/mcq/generate/${documentId}`,
    {
      method: 'POST',
      body: JSON.stringify({ count, difficulty }),
    }
  );
}

export async function fetchDocumentMCQs(documentId: string) {
  return request<{ success: boolean; mcqs: MCQItem[] }>(`/api/mcq/${documentId}`);
}

export async function submitMCQAttemptApi(
  documentId: string,
  answers: Record<string, string>
) {
  return request<{ success: boolean; result: MCQAttemptResult }>(
    `/api/mcq/submit/${documentId}`,
    {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }
  );
}
