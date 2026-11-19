# DocMind AI 🧠📚✨

> **An Intelligent Document-Grounded Learning Assistant and Formative Assessment Platform for Students.**
> Powered by React 19, Node.js, Express, and Google Gemini (`gemini-3.8-flash`).

[![Live Demo](https://img.shields.io/badge/Live%20Demo-DocMind%20App-0D7466?style=for-the-badge&logo=render&logoColor=white)](https://docmind-ai.onrender.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-3.8%20Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)

---

## 🌐 Live Application Link

- **Live Deployed App:**  
  👉 **`https://docmind-ai.onrender.com`** *(or deploy on your own domain/hosting)*
- **Local Development:**  
  Run locally on `http://localhost:3000` via VS Code terminal.

---

## 📖 1. Project Overview

**DocMind** transforms static academic study materials (`.pdf`, `.txt`) into interactive, document-grounded learning environments. Instead of passively reading through dense textbooks, research papers, or lecture notes, students can upload documents to:

1. **Structured 5-Part Summaries**: Overview, Key Points, Important Concepts, Glossary Terms, and Conclusions.
2. **Grounded Q&A Chat**: Ask questions and receive answers strictly verified against the uploaded file without hallucinations. If not present in the document, it reliably responds:
   > *"I couldn't find this information in the uploaded document."*
3. **Suggested Study Prompts**: 6–10 automatically generated study prompts that can be asked with one click.
4. **Interactive MCQ Practice Arena**: Generate 5, 10, 15, or 20 multiple choice questions across Easy, Medium, or Hard difficulty levels.
5. **Real-Time Assessment & Explanations**: Instant score calculation (e.g. 5/5) with detailed rationale grounded in the text.
6. **Zero-Downtime Resilience**: Includes exponential backoff retries and local sentence/keyword extraction algorithms to continue answering even during API rate limits.

---

## 🚀 2. System Architecture

```text
                        ┌──────────────────────────────────────────────┐
                        │        Client: React 19 + TypeScript         │
                        │  Tailwind CSS 4 | Lucide Icons | Motion UI   │
                        └──────────────────────┬───────────────────────┘
                                               │ HTTP / REST / JWT
                                               ▼
                        ┌──────────────────────────────────────────────┐
                        │      Server: Express.js (Node.js 22)         │
                        │  Multer (10MB Memory) | bcryptjs | JWT Auth  │
                        └──────┬───────────────────────────────┬───────┘
                               │                               │
                ┌──────────────┴──────────────┐ ┌──────────────┴──────────────┐
                ▼                             ▼ ▼                             ▼
   ┌─────────────────────────┐  ┌─────────────────────────┐     ┌─────────────────────────┐
   │    Text Parsing Engine  │  │   AI Orchestration      │     │  Database (data/db.json)│
   │  pdf-parse & Sanitizer  │  │   @google/genai SDK     │     │  users, documents,      │
   │  Scanned PDF Detection  │  │   gemini-3.8-flash      │     │  questions, mcqs,       │
   └─────────────────────────┘  │   Local Fallback Engine │     │  mcq_attempts           │
                                └─────────────────────────┘     └─────────────────────────┘
```

---

## 🛠️ 3. Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite | Reactive, type-safe single-page application |
| **Styling** | Tailwind CSS v4, Lucide Icons | Accessible Teal Green (`#0D7466`) & Off-White aesthetic |
| **Backend** | Node.js, Express.js | High-throughput REST API server |
| **File Parsing** | `pdf-parse` v2, regex sanitizers | In-memory stream extraction for text-based PDFs and TXT files |
| **Security** | `bcryptjs`, `jsonwebtoken` | Password hashing (salt rounds: 10) & stateless JWT auth |
| **AI Integration** | `@google/genai` (v2.4.0) | `gemini-3.8-flash` with strict schema validation |
| **Database** | Embedded JSON Database (`data/db.json`) | MongoDB-like collection storage running out of the box |

---

## 📂 4. Project Directory Structure

```text
DocMind/
├── backend/
│   ├── controllers/           # Endpoint handlers (auth, document, chat, mcq)
│   ├── middleware/            # JWT verification & Multer file validation
│   ├── models/db.ts           # Collection database engine
│   ├── routes/                # REST API route declarations
│   ├── services/              # Gemini AI client & PDF parsing services
│   └── utils/                 # ASCII sanitization & text chunking
├── src/
│   ├── components/            # Navbar, Sidebar, Chat, MCQ cards, Uploaders
│   ├── context/               # AuthContext (JWT management)
│   ├── pages/                 # Dashboard, Q&A, Summaries, MCQs, Profile
│   ├── services/api.ts        # Client fetch wrapper
│   └── types/                 # Shared TypeScript interfaces
├── data/db.json               # Persistent data storage
├── server.ts                  # Full-stack Express & Vite entry point
├── PROJECT_REPORT.md          # Comprehensive Academic Seminar & Project Report
├── package.json
└── README.md
```

---

## 💻 5. Quickstart & Local Installation

### Prerequisites
- Node.js (v20 or higher)
- npm or pnpm
- Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/DocMind.git
cd DocMind
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY="your_google_gemini_api_key_here"
JWT_SECRET="your_custom_jwt_secret_key"
PORT=3000
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📤 6. How to Push this Project to GitHub

Follow these steps in your terminal to create and push this repository to GitHub:

### Step 1: Initialize Git and stage files
```bash
git init
git add .
git commit -m "Initial commit: DocMind AI Document Learning Assistant"
```

### Step 2: Create a new repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Enter Repository name: `DocMind` (or `docmind-ai`).
3. Set visibility to **Public** (or **Private**).
4. Do **not** initialize with README or .gitignore (they already exist here).
5. Click **Create repository**.

### Step 3: Link remote and push
```bash
git branch -M main
git remote add origin https://github.com/<your-github-username>/DocMind.git
git push -u origin main
```

---

## ☁️ 7. Deploying Live with a Clean Link (Render / Railway / Vercel)

You can deploy DocMind on **Render** (free & connects directly to your GitHub repo):

1. Push your repository to your personal GitHub account.
2. Go to [Render.com](https://render.com) and click **New > Web Service**.
3. Select your `DocMind` repository.
4. Configure settings:
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Add Environment Variables under **Environment**:
   - `GEMINI_API_KEY`: `<your_gemini_api_key>`
   - `JWT_SECRET`: `<any_secret_string>`
   - `PORT`: `3000`
6. Click **Deploy Web Service**.
Render will provide you with a clean, professional personal link:
👉 **`https://docmind-ai.onrender.com`** *(No third-party platform branding!)*

---

## 📄 8. Academic Project Report

A complete, formal academic project report formatted for university capstone submissions (including literature review, system architecture diagrams, database schemas, verified test cases, and viva questions) is available in **[`PROJECT_REPORT.md`](./PROJECT_REPORT.md)**.

---

## 📜 9. License

This project is licensed under the Apache 2.0 License.
