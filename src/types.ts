export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: number;
  question: string;
  options: string[];
  correct_answer_index: number;
  difficulty: QuestionDifficulty;
  topic: string;
  explanation: string;
  key_takeaway: string;
}

export interface QuizData {
  id: string;
  createdAt: number;
  test_title: string;
  topic: string;
  difficulty_level: string;
  questions: Question[];
  settings: QuizSettings;
}

export type TimerMode = 'per_question' | 'total_test' | 'untimed';
export type TestDifficultySetting = 'adaptive' | 'easy' | 'medium' | 'hard' | 'as_material';
export type TestGenerationMode = 'synthesis' | 'exact_extract';

export interface QuizSettings {
  numQuestions: number | 'auto';
  difficulty: TestDifficultySetting;
  mode: TestGenerationMode;
  timerMode: TimerMode;
  timePerQuestionSeconds: number; // e.g., 30, 45, 60, 90, 120
  totalTimeMinutes: number; // e.g., 10, 15, 30, 45, 60
  customInstructions?: string;
  instantFeedbackInPractice?: boolean;
}

export interface UserAnswerRecord {
  questionId: number;
  selectedOption: number | null; // null if unselected / timed out
  timeSpentSeconds: number;
  isFlagged: boolean;
}

export interface WeakAreaItem {
  concept: string;
  observation: string;
  fix_action: string;
}

export interface DeepAIAnalysis {
  verdict: string;
  overall_critique: string;
  mastered_topics: string[];
  priority_weak_areas: WeakAreaItem[];
  time_management_feedback: string;
  quick_study_roadmap: string[];
}

export interface PerformanceReport {
  score: number;
  total: number;
  percentage: number;
  grade: string;
  timeTakenSeconds: number;
  avgTimePerQuestion: number;
  accuracyByDifficulty: {
    easy: { correct: number; total: number };
    medium: { correct: number; total: number };
    hard: { correct: number; total: number };
  };
  accuracyByTopic: Record<string, { correct: number; total: number }>;
  fastestQuestionId: number | null;
  slowestQuestionId: number | null;
  flaggedCount: number;
  unansweredCount: number;
  userAnswers: Record<number, UserAnswerRecord>;
  aiAnalysis?: DeepAIAnalysis;
}

export interface SavedTestSession {
  id: string;
  date: string;
  title: string;
  topic: string;
  score: number;
  total: number;
  percentage: number;
  difficulty: string;
  quizData: QuizData;
  report: PerformanceReport;
}
