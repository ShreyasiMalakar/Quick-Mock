import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Grid,
  Check,
  RotateCcw,
} from 'lucide-react';
import { Question, QuizData, UserAnswerRecord } from '../types';
import { formatTime } from '../utils/analytics';

interface ExamScreenProps {
  quizData: QuizData;
  onSubmitExam: (answers: Record<number, UserAnswerRecord>, totalTimeSpent: number) => void;
  onExit: () => void;
}

export const ExamScreen: React.FC<ExamScreenProps> = ({ quizData, onSubmitExam, onExit }) => {
  const { questions, settings, test_title, topic } = quizData;
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion: Question = questions[currentIndex];

  // User state mapping: questionId -> UserAnswerRecord
  const [answers, setAnswers] = useState<Record<number, UserAnswerRecord>>(() => {
    const initial: Record<number, UserAnswerRecord> = {};
    questions.forEach((q) => {
      initial[q.id] = {
        questionId: q.id,
        selectedOption: null,
        timeSpentSeconds: 0,
        isFlagged: false,
      };
    });
    return initial;
  });

  // Timers
  const isPerQuestion = settings.timerMode === 'per_question';
  const isTotalTest = settings.timerMode === 'total_test';
  const isUntimed = settings.timerMode === 'untimed';

  const defaultQuestionDuration = settings.timePerQuestionSeconds || 60;
  const defaultTotalDuration = (settings.totalTimeMinutes || 15) * 60;

  const [perQuestionTimeLeft, setPerQuestionTimeLeft] = useState<number>(defaultQuestionDuration);
  const [totalTimeLeft, setTotalTimeLeft] = useState<number>(defaultTotalDuration);
  const [elapsedTotalTime, setElapsedTotalTime] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Track time spent per active question
  const questionStartTimeRef = useRef<number>(Date.now());

  // Function to record question time on leave/switch
  const recordQuestionTime = useCallback(() => {
    const now = Date.now();
    const duration = Math.round((now - questionStartTimeRef.current) / 1000);
    questionStartTimeRef.current = now;

    setAnswers((prev) => {
      const qid = currentQuestion.id;
      const existing = prev[qid] || {
        questionId: qid,
        selectedOption: null,
        timeSpentSeconds: 0,
        isFlagged: false,
      };
      return {
        ...prev,
        [qid]: {
          ...existing,
          timeSpentSeconds: existing.timeSpentSeconds + Math.max(duration, 1),
        },
      };
    });
  }, [currentQuestion.id]);

  // Main countdown / elapsed timer loop
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setElapsedTotalTime((prev) => prev + 1);

      if (isPerQuestion) {
        setPerQuestionTimeLeft((prev) => {
          if (prev <= 1) {
            // Per question timeout! Auto-advance or finish
            recordQuestionTime();
            if (currentIndex < questions.length - 1) {
              setCurrentIndex((idx) => idx + 1);
              return defaultQuestionDuration;
            } else {
              // Final question expired, trigger submit
              clearInterval(timer);
              handleConfirmSubmit();
              return 0;
            }
          }
          return prev - 1;
        });
      } else if (isTotalTest) {
        setTotalTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            recordQuestionTime();
            handleConfirmSubmit();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isPerQuestion, isTotalTest, currentIndex, questions.length, defaultQuestionDuration, recordQuestionTime]);

  // Reset per-question countdown whenever active question changes
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
    if (isPerQuestion) {
      setPerQuestionTimeLeft(defaultQuestionDuration);
    }
  }, [currentIndex, isPerQuestion, defaultQuestionDuration]);

  // Handle Option selection
  const handleSelectOption = (optionIndex: number) => {
    setAnswers((prev) => {
      const qid = currentQuestion.id;
      const existing = prev[qid];
      return {
        ...prev,
        [qid]: {
          ...existing,
          selectedOption: optionIndex,
        },
      };
    });
  };

  // Toggle flag / bookmark
  const handleToggleFlag = () => {
    setAnswers((prev) => {
      const qid = currentQuestion.id;
      const existing = prev[qid];
      return {
        ...prev,
        [qid]: {
          ...existing,
          isFlagged: !existing.isFlagged,
        },
      };
    });
  };

  // Clear answer
  const handleClearAnswer = () => {
    setAnswers((prev) => {
      const qid = currentQuestion.id;
      const existing = prev[qid];
      return {
        ...prev,
        [qid]: {
          ...existing,
          selectedOption: null,
        },
      };
    });
  };

  // Navigation
  const goToQuestion = (targetIndex: number) => {
    if (targetIndex >= 0 && targetIndex < questions.length && targetIndex !== currentIndex) {
      recordQuestionTime();
      setCurrentIndex(targetIndex);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1);
    } else {
      setShowSubmitModal(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1);
    }
  };

  const handleConfirmSubmit = () => {
    recordQuestionTime();
    onSubmitExam(answers, elapsedTotalTime);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid if user is focused on an input or modal is open
      if (showSubmitModal || isPaused) return;

      const key = e.key.toLowerCase();
      if (['1', 'a'].includes(key) && currentQuestion.options[0]) handleSelectOption(0);
      else if (['2', 'b'].includes(key) && currentQuestion.options[1]) handleSelectOption(1);
      else if (['3', 'c'].includes(key) && currentQuestion.options[2]) handleSelectOption(2);
      else if (['4', 'd'].includes(key) && currentQuestion.options[3]) handleSelectOption(3);
      else if (key === 'f') handleToggleFlag();
      else if (key === 'arrowright' || key === 'n') handleNext();
      else if (key === 'arrowleft' || key === 'p') handlePrevious();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, showSubmitModal, isPaused]);

  // Current answer state
  const activeRecord = answers[currentQuestion.id] || {
    selectedOption: null,
    isFlagged: false,
    timeSpentSeconds: 0,
  };
  const selectedOptionIndex = activeRecord.selectedOption;
  const isCurrentFlagged = activeRecord.isFlagged;

  // Stats for palette & modal
  const answeredCount = Object.values(answers).filter(
    (a) => a.selectedOption !== null && a.selectedOption >= 0
  ).length;
  const flaggedCount = Object.values(answers).filter((a) => a.isFlagged).length;
  const unansweredCount = questions.length - answeredCount;

  // Timer urgency calculation
  let displaySeconds = 0;
  let isUrgent = false;

  if (isPerQuestion) {
    displaySeconds = perQuestionTimeLeft;
    isUrgent = perQuestionTimeLeft <= 10;
  } else if (isTotalTest) {
    displaySeconds = totalTimeLeft;
    isUrgent = totalTimeLeft <= 120; // under 2 mins
  } else {
    displaySeconds = elapsedTotalTime;
  }

  // Difficulty badge colors
  const diffColors: Record<string, string> = {
    easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    hard: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Test Info */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onExit}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Exit Exam"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                {test_title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{topic}</span>
                <span>•</span>
                <span className="text-indigo-400 font-medium">
                  {answeredCount}/{questions.length} answered
                </span>
              </div>
            </div>
          </div>

          {/* Right: Timer & Tools */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Live Timer Box */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-sm sm:text-base font-bold transition shadow-inner ${
                isUrgent
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                  : 'bg-slate-950 text-indigo-300 border-indigo-500/30'
              }`}
            >
              <Clock className={`w-4 h-4 ${isUrgent ? 'text-rose-400' : 'text-indigo-400'}`} />
              <span>{formatTime(displaySeconds)}</span>
              {isPerQuestion && <span className="text-[10px] font-sans text-slate-400">/Q</span>}
            </div>

            {/* Pause / Resume (Only in untimed or practice) */}
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title={isPaused ? 'Resume Exam' : 'Pause Exam'}
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
            </button>

            {/* Question Palette Toggle */}
            <button
              type="button"
              onClick={() => setIsPaletteOpen(!isPaletteOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                isPaletteOpen
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Palette</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="hidden md:flex p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Question Progress Bar */}
        <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
          <div
            className="bg-indigo-500 h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 sm:py-8 flex flex-col md:flex-row gap-6">
        {/* Active Question Container */}
        <div className="flex-1 flex flex-col justify-between space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            {/* Meta tags & Bookmark */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border capitalize ${
                    diffColors[currentQuestion.difficulty] || diffColors.medium
                  }`}
                >
                  {currentQuestion.difficulty}
                </span>
                {currentQuestion.topic && (
                  <span className="hidden sm:inline text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {currentQuestion.topic}
                  </span>
                )}
              </div>

              {/* Bookmark / Flag */}
              <button
                type="button"
                onClick={handleToggleFlag}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                  isCurrentFlagged
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <Flag className={`w-3.5 h-3.5 ${isCurrentFlagged ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{isCurrentFlagged ? 'Flagged' : 'Flag for Review'}</span>
              </button>
            </div>

            {/* Question Stem */}
            <div className="text-lg sm:text-xl font-semibold text-white leading-relaxed mb-8">
              {currentQuestion.question}
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOptionIndex === idx;
                const letter = String.fromCharCode(65 + idx); // A, B, C, D

                // Instant practice mode feedback
                const showInstantFeedback = settings.timerMode === 'untimed' && settings.instantFeedbackInPractice && selectedOptionIndex !== null;
                const isCorrect = idx === currentQuestion.correct_answer_index;
                const isWrongSelection = isSelected && !isCorrect;

                let optionBorderClass = 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950 text-slate-200';
                if (showInstantFeedback) {
                  if (isCorrect) {
                    optionBorderClass = 'border-emerald-500 bg-emerald-950/40 text-emerald-200 ring-1 ring-emerald-500';
                  } else if (isWrongSelection) {
                    optionBorderClass = 'border-rose-500 bg-rose-950/40 text-rose-200 ring-1 ring-rose-500';
                  }
                } else if (isSelected) {
                  optionBorderClass = 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500 shadow-lg shadow-indigo-500/10';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 group cursor-pointer ${optionBorderClass}`}
                  >
                    <span
                      className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold shrink-0 transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="flex-1 text-sm sm:text-base leading-snug pt-0.5">{option}</span>
                    {isSelected && (
                      <Check className="w-5 h-5 text-indigo-400 shrink-0 self-center" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant feedback explanation in practice mode */}
            {settings.timerMode === 'untimed' &&
              settings.instantFeedbackInPractice &&
              selectedOptionIndex !== null && (
                <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
                  <div className="font-bold text-sm text-indigo-400 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    <span>Instant Explanation</span>
                  </div>
                  <p className="leading-relaxed">{currentQuestion.explanation}</p>
                  <p className="text-amber-400 font-semibold pt-1">
                    Key takeaway: {currentQuestion.key_takeaway}
                  </p>
                </div>
              )}
          </div>

          {/* Action Navigation Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous [P]</span>
              </button>

              {selectedOptionIndex !== null && (
                <button
                  type="button"
                  onClick={handleClearAnswer}
                  className="px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-slate-800 text-xs font-medium transition"
                  title="Clear choice"
                >
                  Clear Choice
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-indigo-500/30 bg-slate-900 hover:bg-indigo-950/50 text-indigo-300 text-xs font-bold transition"
              >
                Submit Exam
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20"
              >
                <span>{currentIndex === questions.length - 1 ? 'Finish & Review' : 'Next [N]'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Question Palette Sidebar (Toggleable or Desktop Grid) */}
        {(isPaletteOpen || window.innerWidth >= 1024) && (
          <aside className="w-full md:w-64 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl h-fit space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Question Palette
              </h3>
              <span className="text-xs text-indigo-400 font-semibold">
                {answeredCount}/{questions.length}
              </span>
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const rec = answers[q.id];
                const isAnswered = rec && rec.selectedOption !== null && rec.selectedOption >= 0;
                const isFlagged = rec?.isFlagged;
                const isCurrent = idx === currentIndex;

                let btnClass = 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700';

                if (isCurrent) {
                  btnClass = 'bg-indigo-600 border-white text-white ring-2 ring-indigo-400 font-extrabold';
                } else if (isFlagged && isAnswered) {
                  btnClass = 'bg-purple-900/60 border-purple-500 text-purple-200';
                } else if (isFlagged) {
                  btnClass = 'bg-amber-900/60 border-amber-500 text-amber-200';
                } else if (isAnswered) {
                  btnClass = 'bg-emerald-900/40 border-emerald-500/50 text-emerald-300';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => goToQuestion(idx)}
                    className={`h-9 rounded-lg border text-xs font-bold transition flex items-center justify-center relative cursor-pointer ${btnClass}`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Palette Legend */}
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Flagged for Review ({flaggedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span>Unanswered ({unansweredCount})</span>
              </div>
            </div>
          </aside>
        )}
      </main>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Submit Examination?</h3>
                <p className="text-xs text-slate-400">Review your status before finalizing.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <div>
                <div className="text-lg font-bold text-emerald-400">{answeredCount}</div>
                <div className="text-[11px] text-slate-400">Answered</div>
              </div>
              <div>
                <div className="text-lg font-bold text-rose-400">{unansweredCount}</div>
                <div className="text-[11px] text-slate-400">Unanswered</div>
              </div>
              <div>
                <div className="text-lg font-bold text-amber-400">{flaggedCount}</div>
                <div className="text-[11px] text-slate-400">Flagged</div>
              </div>
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
                ⚠️ You have {unansweredCount} unanswered questions. Unanswered questions will be scored as 0.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
              >
                Continue Test
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Screen Overlay */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mx-auto">
              <Pause className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Exam Paused</h3>
            <p className="text-xs text-slate-400">
              The test timer is currently paused. Questions are hidden until resumed to simulate test integrity.
            </p>
            <button
              type="button"
              onClick={() => setIsPaused(false)}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
            >
              Resume Examination
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
