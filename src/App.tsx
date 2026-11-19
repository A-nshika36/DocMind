/**
 * DocuLearn AI - Main Application Component
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.js';
import { DocumentItem } from './types/index.js';
import { fetchMyDocuments } from './services/api.js';

// Layout Components
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';

// Pages
import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { UploadDocumentPage } from './pages/UploadDocumentPage.js';
import { MyDocumentsPage } from './pages/MyDocumentsPage.js';
import { SummaryPage } from './pages/SummaryPage.js';
import { AskQuestionsPage } from './pages/AskQuestionsPage.js';
import { SuggestedQuestionsPage } from './pages/SuggestedQuestionsPage.js';
import { MCQPracticePage } from './pages/MCQPracticePage.js';
import { ProfilePage } from './pages/ProfilePage.js';

export default function App() {
  const { isAuthenticated, user } = useAuth();

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string | null>(null);

  // Documents state
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [pendingQuestionForChat, setPendingQuestionForChat] = useState<string | null>(null);

  // Sync tab with authentication state
  useEffect(() => {
    if (isAuthenticated) {
      if (currentTab === 'landing' || currentTab === 'login' || currentTab === 'register') {
        setCurrentTab('dashboard');
      }
      loadDocuments();
    } else {
      if (currentTab !== 'login' && currentTab !== 'register') {
        setCurrentTab('landing');
      }
      setDocuments([]);
      setSelectedDoc(null);
    }
  }, [isAuthenticated]);

  const loadDocuments = async () => {
    try {
      const res = await fetchMyDocuments();
      setDocuments(res.documents || []);

      // If we don't have an active selected document yet, select the most recently uploaded one
      if (res.documents && res.documents.length > 0) {
        setSelectedDoc((prev) => {
          if (prev) {
            // Keep updated state of current doc if still present
            const found = res.documents.find((d) => d.id === prev.id);
            return found || res.documents[0];
          }
          return res.documents[0];
        });
      } else {
        setSelectedDoc(null);
      }
    } catch (err) {
      console.error('Error fetching user documents:', err);
    }
  };

  const handleSelectDoc = (doc: DocumentItem) => {
    setSelectedDoc(doc);
  };

  const handleNavigate = (tab: string, state?: { successMessage?: string }) => {
    if (state?.successMessage) {
      setLoginSuccessMessage(state.successMessage);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToChatWithQuestion = (question: string) => {
    setPendingQuestionForChat(question);
    setCurrentTab('chat');
  };

  const handleDocumentUploaded = (newDoc: DocumentItem) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setSelectedDoc(newDoc);
  };

  // If user is not authenticated, show public auth pages
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col">
        <Navbar onNavigate={handleNavigate} />
        <main className="flex-1">
          {currentTab === 'register' && (
            <RegisterPage onNavigate={handleNavigate} />
          )}
          {currentTab === 'login' && (
            <LoginPage
              onNavigate={handleNavigate}
              successMessage={loginSuccessMessage}
            />
          )}
          {currentTab !== 'register' && currentTab !== 'login' && (
            <LandingPage onNavigate={handleNavigate} />
          )}
        </main>
      </div>
    );
  }

  // Authenticated Dashboard Layout
  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col text-[#1E2929]">
      <Navbar
        onNavigate={handleNavigate}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        showSidebarToggle={true}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          activeTab={currentTab}
          onSelectTab={(tab) => handleNavigate(tab)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          selectedDocName={selectedDoc?.file_name}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigate={handleNavigate}
              documents={documents}
              selectedDoc={selectedDoc}
              onSelectDoc={handleSelectDoc}
            />
          )}

          {currentTab === 'my-documents' && (
            <MyDocumentsPage
              documents={documents}
              selectedDoc={selectedDoc}
              onSelectDoc={handleSelectDoc}
              onNavigate={handleNavigate}
              onRefreshDocuments={loadDocuments}
            />
          )}

          {currentTab === 'upload' && (
            <UploadDocumentPage
              onUploadSuccess={handleDocumentUploaded}
              onNavigateToDoc={(doc) => {
                handleSelectDoc(doc);
                handleNavigate('summary');
              }}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'summary' && (
            <SummaryPage
              selectedDoc={selectedDoc}
              documents={documents}
              onSelectDoc={handleSelectDoc}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'chat' && (
            <AskQuestionsPage
              selectedDoc={selectedDoc}
              documents={documents}
              onSelectDoc={handleSelectDoc}
              onNavigate={handleNavigate}
              pendingQuestion={pendingQuestionForChat}
              onClearPendingQuestion={() => setPendingQuestionForChat(null)}
            />
          )}

          {currentTab === 'suggested-questions' && (
            <SuggestedQuestionsPage
              selectedDoc={selectedDoc}
              documents={documents}
              onSelectDoc={handleSelectDoc}
              onNavigateToChatWithQuestion={handleNavigateToChatWithQuestion}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'mcq' && (
            <MCQPracticePage
              selectedDoc={selectedDoc}
              documents={documents}
              onSelectDoc={handleSelectDoc}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'profile' && <ProfilePage />}
        </main>
      </div>
    </div>
  );
}
