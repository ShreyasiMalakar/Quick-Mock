import React, { useState, useEffect } from 'react';
import { SetupScreen } from './components/SetupScreen';
import { ExamScreen } from './components/ExamScreen';
import { ResultScreen } from './components/ResultScreen';
import { HistoryModal } from './components/HistoryModal';
import { QuizData, QuizSettings, UserAnswerRecord, PerformanceReport, SavedTestSession, Question } from './types';
import { calculatePerformanceReport } from './utils/analytics';

const STORAGE_KEY = 'quickquiz_ai_saved_sessions_v1';

export default function App() {
  const [view, setView] = useState<'setup' | 'exam' | 'result'>('setup');
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  const [activeReport, setActiveReport] = useState<PerformanceReport | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // History state
  const [savedSessions, setSavedSessions] = useState<SavedTestSession[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedSessions(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not read history from localStorage', e);
    }
  }, []);

  // Save session to localStorage
  const saveSessionToStorage = (session: SavedTestSession) => {
    try {
      setSavedSessions((prev) => {
        // Space optimization: keep the last 15 sessions max
        const updated = [session, ...prev.filter((s) => s.id !== session.id)].slice(0, 15);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.warn('Could not save session to localStorage', e);
    }
  };

  // Generate & start test
  const handleStartQuiz = async (
    materialText: string,
    settings: QuizSettings,
    materialTitle?: string,
    fileBase64?: string,
    fileMimeType?: string
  ) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep('Ingesting and analyzing material context...');

    try {
      // Step simulation for smooth UX feedback
      const timer1 = setTimeout(() => {
        setLoadingStep('Formulating high-yield question items & distractors...');
      }, 1200);

      const timer2 = setTimeout(() => {
        setLoadingStep('Balancing difficulty & synthesizing explanations...');
      }, 2500);

      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialText,
          fileBase64,
          fileMimeType,
          numQuestions: settings.numQuestions,
          difficulty: settings.difficulty,
          mode: settings.mode,
          customInstructions: settings.customInstructions,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const data = await response.json();

      if (!response.ok || !data.success || !data.quiz) {
        throw new Error(data.error || 'Failed to generate mock test. Please try again.');
      }

      const generatedQuiz: QuizData = {
        id: 'quiz_' + Date.now(),
        createdAt: Date.now(),
        test_title: materialTitle || data.quiz.test_title || 'Mock Test',
        topic: data.quiz.topic || 'General Knowledge',
        difficulty_level: data.quiz.difficulty_level || settings.difficulty,
        questions: data.quiz.questions,
        settings,
      };

      setActiveQuiz(generatedQuiz);
      setActiveReport(null);
      setView('exam');
    } catch (err: any) {
      console.error('Quiz creation failed:', err);
      setErrorMessage(err.message || 'Error communicating with generation engine.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Submit test and compute analytics
  const handleSubmitExam = (answers: Record<number, UserAnswerRecord>, totalTimeSpent: number) => {
    if (!activeQuiz) return;

    const report = calculatePerformanceReport(activeQuiz.questions, answers, totalTimeSpent);
    setActiveReport(report);

    // Save to test history
    const session: SavedTestSession = {
      id: activeQuiz.id,
      date: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      title: activeQuiz.test_title,
      topic: activeQuiz.topic,
      score: report.score,
      total: report.total,
      percentage: report.percentage,
      difficulty: activeQuiz.settings.difficulty,
      quizData: activeQuiz,
      report,
    };
    saveSessionToStorage(session);

    setView('result');
  };

  // Retake full exam
  const handleRetakeFull = () => {
    if (!activeQuiz) return;
    setView('exam');
  };

  // Retake only missed questions
  const handleRetakeMissed = (missedQuestions: Question[]) => {
    if (!activeQuiz || missedQuestions.length === 0) return;

    const subQuiz: QuizData = {
      ...activeQuiz,
      id: 'quiz_retry_' + Date.now(),
      test_title: `${activeQuiz.test_title} (Missed Review)`,
      questions: missedQuestions.map((q, idx) => ({ ...q, id: idx + 1 })),
      settings: {
        ...activeQuiz.settings,
        numQuestions: missedQuestions.length,
      },
    };

    setActiveQuiz(subQuiz);
    setActiveReport(null);
    setView('exam');
  };

  // Load a past session from history
  const handleLoadSession = (session: SavedTestSession) => {
    setActiveQuiz(session.quizData);
    setActiveReport(session.report);
    setIsHistoryOpen(false);
    setView('result');
  };

  // Clear history
  const handleClearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSavedSessions([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Global Error Banner if any */}
      {errorMessage && (
        <div className="bg-rose-600/90 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 text-center flex items-center justify-center gap-2 shadow-md">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="underline ml-2 hover:text-rose-200 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* View routing */}
      <div className="flex-1">
        {view === 'setup' && (
          <SetupScreen
            onStartQuiz={handleStartQuiz}
            isLoading={isLoading}
            loadingStep={loadingStep}
            onOpenHistory={() => setIsHistoryOpen(true)}
            hasHistory={savedSessions.length > 0}
          />
        )}

        {view === 'exam' && activeQuiz && (
          <ExamScreen
            quizData={activeQuiz}
            onSubmitExam={handleSubmitExam}
            onExit={() => setView('setup')}
          />
        )}

        {view === 'result' && activeReport && activeQuiz && (
          <ResultScreen
            report={activeReport}
            quizData={activeQuiz}
            onRetakeFull={handleRetakeFull}
            onRetakeMissed={handleRetakeMissed}
            onNewTest={() => setView('setup')}
          />
        )}
      </div>

      {/* History Modal */}
      <HistoryModal
        sessions={savedSessions}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLoadSession={handleLoadSession}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
