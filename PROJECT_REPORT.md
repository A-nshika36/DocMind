# PROJECT REPORT: DocMind — AI-Powered Document Learning Assistant

---

## 1. PROJECT TITLE & DETAILS
- **Project Name:** DocMind (AI Document Learning Assistant)
- **Domain:** Artificial Intelligence, Full-Stack Web Development, EdTech (Educational Technology)
- **Target Audience:** Students, Researchers, Educators, and Self-learners
- **Tech Stack:** React 19, TypeScript, Tailwind CSS, Node.js, Express.js, Google Gemini API (`@google/genai`), `pdf-parse`, `bcryptjs`, `jsonwebtoken`
- **Deployment:** Live Web Application / Local Academic Instance

---

## 2. ABSTRACT / EXECUTIVE SUMMARY
Modern academic and professional learning requires studying voluminous textbooks, lecture notes, research papers, and certificates. Passive reading often leads to poor comprehension, fatigue, and difficulty testing oneself. 

**DocMind** is an intelligent, full-stack web application that transforms static study documents (`.pdf`, `.txt`) into interactive, document-grounded learning hubs. Users can register, log in securely, and upload their study files. DocMind extracts text on the server and utilizes Google Gemini AI (`gemini-3.8-flash`) combined with strict document-grounded parameters and zero-downtime retrieval algorithms to:
1. Generate 5-part structured summaries (Overview, Key Points, Core Concepts, Terminology, Conclusions).
2. Answer contextual student questions strictly using document facts without AI hallucinations.
3. Automatically generate relevant study and revision questions.
4. Create customizable Multiple Choice Practice Quizzes (MCQs) with difficulty settings, instant scoring, and document-backed explanations.

---

## 3. PROBLEM STATEMENT
1. **Information Overload:** Students spend excessive hours manually skimming lengthy PDFs to find key concepts.
2. **AI Hallucinations in General LLMs:** Generic AI chatbots frequently invent fictional citations, facts, or answers not found in student notes or syllabus material.
3. **Lack of Active Recall:** Reading notes passively does not reinforce long-term memory. Students lack automatic quiz generation grounded specifically in their own course materials.
4. **Privacy & Organization:** Students need a dedicated, isolated space where their personal documents, chat history, and quiz attempts are saved per user account.

---

## 4. OBJECTIVES OF THE PROJECT
- **Document Text Extraction:** Safely upload, validate (format and 10MB limit), and extract clean selectable text from PDFs and TXT files.
- **Strict Grounded Q&A:** Eliminate model hallucinations by instructing the model to reply: *"I couldn't find this information in the uploaded document"* whenever a query is outside the source material.
- **Active Assessment (MCQs):** Enable students to test themselves on 5, 10, 15, or 20 questions across Easy, Medium, or Hard difficulty levels.
- **User Authentication & Data Isolation:** Implement secure password hashing (`bcryptjs`) and JWT authentication so that each user accesses only their own documents and chat logs.
- **High Reliability & Resilience:** Include exponential backoff retries and local document search fallbacks to ensure uninterrupted service even under API rate limits.

---

## 5. SYSTEM ARCHITECTURE & WORKFLOW

### A. Architectural Layers
1. **Frontend (Client Layer):**
   - Built with React 19 and TypeScript for typed component development.
   - Styled with Tailwind CSS using an accessible Teal Green (`#0D7466`) & Off-White (`#FBFBFA`) aesthetic.
   - Modular pages: Landing, Login, Register, Dashboard, Upload, My Documents, Summary, Document Q&A, Suggested Questions, MCQ Practice, and Profile.
2. **Backend (Server & API Layer):**
   - Node.js & Express.js REST API.
   - Multer middleware for in-memory multipart/form-data upload.
   - JWT authentication middleware protecting student routes.
3. **Database Layer:**
   - Persistent JSON collection store (`data/db.json`) implementing standard MongoDB/Mongoose-like CRUD operations (`find`, `findById`, `create`, `update`, `delete`).
   - Collections: `users`, `documents`, `questions`, `mcqs`, `mcq_attempts`.
4. **AI & Processing Layer:**
   - Text parsing via `pdf-parse` v2 and text cleaning utilities.
   - Google Gemini API (`gemini-3.8-flash`) with structured output schemas (`Type.OBJECT`, `Type.ARRAY`).

### B. User Flow Diagram
```
   [ User ]
      │
      ├──> Register / Login (JWT Authentication)
      │
      ├──> Dashboard
      │       │
      │       └──> Upload Study File (.pdf / .txt up to 10MB)
      │               │
      │               └──> Server Text Extraction & Validation
      │                       │
      ├───────────────────────┴────────────────────────┐
      ▼                                                ▼
[ AI Structured Summary ]                    [ Document Q&A Chat ]
- Overview                                   - Grounded Q&A
- Key Takeaways                              - Anti-hallucination guard
- Important Concepts                         - Auto-scroll & history
- Key Terms & Definitions                              │
- Conclusion                                           ▼
      │                                      [ Suggested Questions ]
      │                                      - 6-10 auto-generated prompts
      │                                      - Click to ask in Chat
      ▼                                                │
[ MCQ Practice Arena ] <───────────────────────────────┘
- 5 / 10 / 15 / 20 Questions
- Easy / Medium / Hard Difficulty
- Instant Scoring (e.g., 8 / 10)
- Correct/Incorrect Review & Explanations
```

---

## 6. KEY MODULES & IMPLEMENTATION DETAILS

### Module 1: Authentication & User Management
- **Password Security:** Passwords hashed with `bcryptjs` (salt rounds: 10). Plain-text passwords are never stored.
- **Session Tokens:** Stateless JSON Web Tokens (JWT) signed with `JWT_SECRET` and stored in localStorage.
- **Route Protection:** Express middleware verifies `Bearer <token>` on all `/api/documents/*`, `/api/chat/*`, and `/api/mcq/*` endpoints.

### Module 2: File Ingestion & Text Processing
- **File Validation:** Rejects unsupported extensions (only `.pdf` and `.txt` allowed) and files exceeding 10MB.
- **Scanned Document Detection:** Checks if extracted text is empty or purely whitespace, warning the user if the PDF contains scanned images without OCR text.
- **Text Normalization:** Strips binary artifacts and non-printable ASCII control characters.

### Module 3: Structured AI Summarization
- Generates a five-part structured breakdown using Gemini's JSON schema mode:
  - **Overview:** Main context and scope.
  - **Key Points:** Bulleted actionable takeaways.
  - **Important Concepts:** Core topics explained simply.
  - **Important Terms:** Glossary terms with definitions.
  - **Conclusion:** Summary of outcomes.

### Module 4: Grounded Document Q&A
- Prompts Gemini with low temperature (`0.2`) and strict system instructions.
- If the required information does not exist in the document, it returns:
  `"I couldn't find this information in the uploaded document."`
- Integrated with conversational memory for multi-turn dialogues.
- Resilient fallback engine searches document sentences and lines if API rate limits occur.

### Module 5: MCQ Generator & Interactive Practice Arena
- Users configure count (5, 10, 15, 20) and difficulty (Easy, Medium, Hard).
- Returns 4 distinct options (A, B, C, D), correct answer key, and document citations.
- Includes a live interactive quiz runner, progress bar, instant score breakdown, and answer explanations.

---

## 7. DATABASE SCHEMA DESIGN

| Collection | Key Fields | Description |
| :--- | :--- | :--- |
| **users** | `id`, `name`, `email`, `password_hash`, `created_at` | User credentials and profile |
| **documents** | `id`, `user_id`, `file_name`, `file_type`, `file_size`, `word_count`, `char_count`, `extracted_text`, `summary`, `uploaded_at` | Uploaded files and cached summaries |
| **questions** | `id`, `user_id`, `document_id`, `question`, `answer`, `created_at` | Chat Q&A history |
| **mcqs** | `id`, `document_id`, `user_id`, `question`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer`, `explanation`, `difficulty`, `created_at` | Generated quiz questions |
| **mcq_attempts** | `id`, `user_id`, `document_id`, `score`, `total_questions`, `answers`, `attempted_at` | User practice quiz scores |

---

## 8. TESTING & RESULTS
- **Health Check API:** Verified `GET /api/health` returns `200 OK` with service metadata.
- **Auth Flow Testing:** Verified registration, credential validation, login, and token generation.
- **Document Upload & Parsing:** Verified with both `.txt` and `.pdf` files (including sample certificate and lecture notes).
- **Q&A Grounding Verification:**
  - In-document questions (e.g., recipient name, verification codes, topics) correctly answered.
  - Out-of-document questions (e.g., unrelated general knowledge) rejected with the grounded fallback statement.
- **MCQ Practice Verification:** Verified quiz generation, scoring calculations, and explanation display.

---

## 9. FUTURE ENHANCEMENTS
1. **OCR Support:** Integrate Tesseract or Google Cloud Vision OCR for handwritten notes and scanned image PDFs.
2. **Audio Study Mode (TTS):** Add text-to-speech to listen to document summaries like a podcast.
3. **Flashcard Deck:** Export concepts and terminology directly into spaced-repetition flashcards.
4. **Collaborative Study Rooms:** Allow multiple students to study and chat about the same document simultaneously.

---

## 10. CONCLUSION
**DocMind** bridges the gap between passive reading and active learning. By combining robust full-stack architecture, strict document grounding, and active recall practice, DocMind provides students with a dependable AI study partner that increases comprehension while eliminating AI hallucinations.
