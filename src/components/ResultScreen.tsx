import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  CheckCircle,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Zap,
  Target,
  Brain,
  Download,
  Filter,
  Check,
  X,
  Flag,
} from 'lucide-react';
import { PerformanceReport, Question, QuizData, DeepAIAnalysis } from '../types';
import { formatTime } from '../utils/analytics';

interface ResultScreenProps {
  report: PerformanceReport;
  quizData: QuizData;
  onRetakeFull: () => void;
  onRetakeMissed: (missedQuestions: Question[]) => void;
  onNewTest: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  report,
  quizData,
  onRetakeFull,
  onRetakeMissed,
  onNewTest,
}) => {
  const { questions, test_title, topic } = quizData;
  const [filterMode, setFilterMode] = useState<'all' | 'incorrect' | 'flagged'>('all');
  const [isRequestingAiAnalysis, setIsRequestingAiAnalysis] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<DeepAIAnalysis | null>(report.aiAnalysis || null);
  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);

  // Trigger celebration confetti for good performance
  useEffect(() => {
    if (report.percentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
        });
      } catch (e) {
        // ignore confetti errors
      }
    }
  }, [report.percentage]);

  // Request AI Deep Tutor Analysis if not already present
  const fetchAiAnalysis = async () => {
    if (aiAnalysis || isRequestingAiAnalysis) return;
    setIsRequestingAiAnalysis(true);
    setAiAnalysisError(null);

    try {
      const resultsBreakdown = questions.map((q) => {
        const ans = report.userAnswers[q.id];
        const isCorrect = ans && ans.selectedOption === q.correct_answer_index;
        return {
          question: q.question,
          topic: q.topic,
          difficulty: q.difficulty,
          isCorrect,
          timeSpent: ans?.timeSpentSeconds || 0,
        };
      });

      const res = await fetch('/api/analyze-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testTitle: test_title,
          score: report.score,
          total: report.total,
          timeSpentSeconds: report.timeTakenSeconds,
          resultsBreakdown,
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setAiAnalysis(data.analysis);
      } else {
        throw new Error(data.error || 'Unable to generate analysis');
      }
    } catch (err: any) {
      console.warn('AI analysis error:', err);
      setAiAnalysisError('Deep analysis unavailable at this moment.');
    } finally {
      setIsRequestingAiAnalysis(false);
    }
  };

  // Identify missed questions
  const missedQuestions = questions.filter((q) => {
    const ans = report.userAnswers[q.id];
    return !ans || ans.selectedOption !== q.correct_answer_index;
  });

  // Filtered review questions
  const displayedQuestions = questions.filter((q) => {
    const ans = report.userAnswers[q.id];
    if (filterMode === 'incorrect') {
      return !ans || ans.selectedOption !== q.correct_answer_index;
    }
    if (filterMode === 'flagged') {
      return ans?.isFlagged;
    }
    return true;
  });

  // Export report as printable text/JSON
  const handleExport = () => {
    const lines = [
      `================================================`,
      `QUICKQUIZ AI - MOCK TEST PERFORMANCE REPORT`,
      `================================================`,
      `Test: ${test_title}`,
      `Topic: ${topic}`,
      `Score: ${report.score} / ${report.total} (${report.percentage}%) - Grade: ${report.grade}`,
      `Time Spent: ${formatTime(report.timeTakenSeconds)} (Avg ${report.avgTimePerQuestion}s/question)`,
      `Date: ${new Date().toLocaleString()}`,
      `\n------------------------------------------------`,
      `QUESTION BREAKDOWN:`,
      `------------------------------------------------`,
    ];

    questions.forEach((q, idx) => {
      const ans = report.userAnswers[q.id];
      const isCorrect = ans && ans.selectedOption === q.correct_answer_index;
      lines.push(`\nQ${idx + 1} [${q.difficulty.toUpperCase()} | ${q.topic}]: ${q.question}`);
      lines.push(`Status: ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);
      lines.push(
        `Your Answer: ${ans?.selectedOption !== null && ans?.selectedOption !== undefined ? q.options[ans.selectedOption] : 'None (Unanswered)'}`
      );
      lines.push(`Correct Answer: ${q.options[q.correct_answer_index]}`);
      lines.push(`Explanation: ${q.explanation}`);
      lines.push(`Key Takeaway: ${q.key_takeaway}`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${test_title.replace(/\s+/g, '_')}_Report.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Grade color
  let gradeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  if (report.percentage >= 80) gradeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  else if (report.percentage >= 60) gradeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Hero Score Card */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Trophy className="w-3.5 h-3.5" />
              <span>Exam Completed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {test_title}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">{topic}</p>
          </div>

          {/* Score Indicator */}
          <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-inner">
            <div className="text-center px-3">
              <div className="text-3xl sm:text-4xl font-black text-indigo-400 tracking-tight">
                {report.score} <span className="text-slate-500 text-xl font-normal">/ {report.total}</span>
              </div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                {report.percentage}% Score
              </div>
            </div>

            <div className="h-10 w-[1px] bg-slate-800" />

            <div className="text-center px-3">
              <div className={`text-2xl sm:text-3xl font-black px-3 py-0.5 rounded-xl border ${gradeColor}`}>
                {report.grade}
              </div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                Grade
              </div>
            </div>
          </div>
        </div>

        {/* Quick Summary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-semibold mb-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Correct</span>
            </div>
            <div className="text-lg font-bold text-white">{report.score}</div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-rose-400 text-xs font-semibold mb-1">
              <XCircle className="w-3.5 h-3.5" />
              <span>Incorrect</span>
            </div>
            <div className="text-lg font-bold text-white">{report.total - report.score}</div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-indigo-400 text-xs font-semibold mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Time Taken</span>
            </div>
            <div className="text-lg font-bold text-white">{formatTime(report.timeTakenSeconds)}</div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-semibold mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Avg Pace</span>
            </div>
            <div className="text-lg font-bold text-white">{report.avgTimePerQuestion}s <span className="text-xs font-normal text-slate-500">/Q</span></div>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {missedQuestions.length > 0 && (
            <button
              type="button"
              onClick={() => onRetakeMissed(missedQuestions)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-md transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake {missedQuestions.length} Missed Question{missedQuestions.length > 1 ? 's' : ''}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRetakeFull}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Retake Full Test</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Report</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onNewTest}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition cursor-pointer ml-auto"
        >
          <span>New Mock Test</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Cognitive Diagnostic & Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Difficulty Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-400" />
            <span>Accuracy by Difficulty</span>
          </h3>

          <div className="space-y-3">
            {(['easy', 'medium', 'hard'] as const).map((diff) => {
              const data = report.accuracyByDifficulty[diff];
              if (!data || data.total === 0) return null;
              const pct = Math.round((data.correct / data.total) * 100);
              const color =
                diff === 'easy' ? 'bg-emerald-500' : diff === 'medium' ? 'bg-amber-500' : 'bg-rose-500';

              return (
                <div key={diff} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300 capitalize">{diff}</span>
                    <span className="text-slate-400">
                      {data.correct}/{data.total} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className={`${color} h-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Topic Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Performance by Concept</span>
          </h3>

          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {Object.entries(report.accuracyByTopic).map(([topicName, data]) => {
              const pct = Math.round((data.correct / Math.max(data.total, 1)) * 100);
              return (
                <div key={topicName} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-300 truncate max-w-[200px]" title={topicName}>
                      {topicName}
                    </span>
                    <span className="text-slate-400">
                      {data.correct}/{data.total} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Deep Cognitive Tutor Analysis Box */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                AI Cognitive Diagnostic Tutor
              </h3>
              <p className="text-xs text-slate-400">
                Personalized conceptual analysis and customized study roadmap
              </p>
            </div>
          </div>

          {!aiAnalysis && (
            <button
              type="button"
              onClick={fetchAiAnalysis}
              disabled={isRequestingAiAnalysis}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isRequestingAiAnalysis ? 'animate-spin' : ''}`} />
              <span>{isRequestingAiAnalysis ? 'Analyzing...' : 'Generate AI Diagnosis'}</span>
            </button>
          )}
        </div>

        {aiAnalysis && (
          <div className="space-y-4 pt-2 text-xs sm:text-sm">
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-start gap-3">
              <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0 mt-0.5">
                {aiAnalysis.verdict}
              </span>
              <p className="text-slate-300 leading-relaxed">{aiAnalysis.overall_critique}</p>
            </div>

            {/* Mastered vs Weak */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mastered */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
                <h4 className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mastered Concepts</span>
                </h4>
                <ul className="space-y-1 text-slate-300 text-xs">
                  {aiAnalysis.mastered_topics.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weak areas & targeted fix */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
                <h4 className="font-bold text-xs text-rose-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>Priority Remedial Targets</span>
                </h4>
                <div className="space-y-2">
                  {aiAnalysis.priority_weak_areas.map((weak, i) => (
                    <div key={i} className="text-xs bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      <div className="font-semibold text-rose-300">{weak.concept}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{weak.observation}</div>
                      <div className="text-emerald-300 text-[11px] font-medium mt-1">
                        Fix: {weak.fix_action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Study Roadmap */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-xs text-indigo-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>3-Step Quick Study Roadmap</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {aiAnalysis.quick_study_roadmap.map((step, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600/40 text-indigo-300 font-bold text-[10px] shrink-0">
                      {i + 1}
                    </span>
                    <span className="leading-snug">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {aiAnalysisError && (
          <div className="text-xs text-rose-400">{aiAnalysisError}</div>
        )}
      </div>

      {/* Question-by-Question Deep Review */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Detailed Question Review</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
              {displayedQuestions.length} shown
            </span>
          </h2>

          {/* Filter options */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg transition ${
                filterMode === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({questions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('incorrect')}
              className={`px-3 py-1 rounded-lg transition ${
                filterMode === 'incorrect' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Incorrect ({missedQuestions.length})
            </button>
            {report.flaggedCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterMode('flagged')}
                className={`px-3 py-1 rounded-lg transition ${
                  filterMode === 'flagged' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Flagged ({report.flaggedCount})
              </button>
            )}
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {displayedQuestions.map((q) => {
            const ans = report.userAnswers[q.id];
            const isAnswered = ans && ans.selectedOption !== null && ans.selectedOption >= 0;
            const isCorrect = isAnswered && ans.selectedOption === q.correct_answer_index;
            const userChoiceIdx = ans?.selectedOption;

            return (
              <div
                key={q.id}
                className={`bg-slate-900 border rounded-2xl p-5 sm:p-6 shadow-lg space-y-4 transition ${
                  isCorrect
                    ? 'border-emerald-500/30'
                    : 'border-rose-500/30'
                }`}
              >
                {/* Header status */}
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-md ${
                        isCorrect
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Correct</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5" />
                          <span>Incorrect</span>
                        </>
                      )}
                    </span>

                    <span className="font-semibold text-slate-400 capitalize">
                      {q.difficulty}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">{q.topic}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{ans?.timeSpentSeconds || 0}s</span>
                    {ans?.isFlagged && <Flag className="w-3.5 h-3.5 text-amber-400 fill-amber-400 ml-1" />}
                  </div>
                </div>

                {/* Question Stem */}
                <div className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                  {q.question}
                </div>

                {/* Options display */}
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isTheCorrectAnswer = optIdx === q.correct_answer_index;
                    const isTheUserChoice = optIdx === userChoiceIdx;
                    const letter = String.fromCharCode(65 + optIdx);

                    let itemClass = 'bg-slate-950/40 border-slate-800/80 text-slate-400';
                    let badge = null;

                    if (isTheCorrectAnswer) {
                      itemClass = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 font-medium ring-1 ring-emerald-500/40';
                      badge = (
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                          Correct Answer
                        </span>
                      );
                    } else if (isTheUserChoice && !isCorrect) {
                      itemClass = 'bg-rose-950/40 border-rose-500/50 text-rose-200 ring-1 ring-rose-500/40';
                      badge = (
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                          Your Choice
                        </span>
                      );
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm ${itemClass}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0 text-slate-300">
                            {letter}
                          </span>
                          <span className="leading-snug">{opt}</span>
                        </div>
                        {badge}
                      </div>
                    );
                  })}
                </div>

                {/* Pedagogical Explanation */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                  <div className="font-bold text-indigo-400 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    <span>Comprehensive Pedagogical Breakdown</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                  <div className="pt-2 border-t border-slate-800/80 flex items-start gap-1.5 text-amber-300 font-medium">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                    <span>High-Yield Anchor: {q.key_takeaway}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
