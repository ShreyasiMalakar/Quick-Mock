import { Question, UserAnswerRecord, PerformanceReport } from '../types';

export function calculatePerformanceReport(
  questions: Question[],
  userAnswers: Record<number, UserAnswerRecord>,
  totalTimeSpentSeconds: number
): PerformanceReport {
  let score = 0;
  let flaggedCount = 0;
  let unansweredCount = 0;

  let fastestTime = Infinity;
  let fastestId: number | null = null;
  let slowestTime = -1;
  let slowestId: number | null = null;

  const accuracyByDifficulty = {
    easy: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard: { correct: 0, total: 0 },
  };

  const accuracyByTopic: Record<string, { correct: number; total: number }> = {};

  questions.forEach((q) => {
    const record = userAnswers[q.id];
    const isAnswered = record && record.selectedOption !== null && record.selectedOption >= 0;
    const isCorrect = isAnswered && record.selectedOption === q.correct_answer_index;

    if (record?.isFlagged) {
      flaggedCount++;
    }

    if (!isAnswered) {
      unansweredCount++;
    } else {
      if (isCorrect) score++;

      const time = record.timeSpentSeconds || 0;
      if (time < fastestTime && time > 0) {
        fastestTime = time;
        fastestId = q.id;
      }
      if (time > slowestTime) {
        slowestTime = time;
        slowestId = q.id;
      }
    }

    // Difficulty breakdown
    const diff = (q.difficulty || 'medium').toLowerCase() as 'easy' | 'medium' | 'hard';
    if (accuracyByDifficulty[diff]) {
      accuracyByDifficulty[diff].total++;
      if (isCorrect) accuracyByDifficulty[diff].correct++;
    }

    // Topic breakdown
    const topic = q.topic || 'General';
    if (!accuracyByTopic[topic]) {
      accuracyByTopic[topic] = { correct: 0, total: 0 };
    }
    accuracyByTopic[topic].total++;
    if (isCorrect) {
      accuracyByTopic[topic].correct++;
    }
  });

  const total = questions.length;
  const percentage = Math.round((score / Math.max(total, 1)) * 100);
  const avgTimePerQuestion = Math.round(totalTimeSpentSeconds / Math.max(total, 1));

  let grade = 'F';
  if (percentage >= 90) grade = 'A+';
  else if (percentage >= 80) grade = 'A';
  else if (percentage >= 70) grade = 'B';
  else if (percentage >= 60) grade = 'C';
  else if (percentage >= 50) grade = 'D';

  return {
    score,
    total,
    percentage,
    grade,
    timeTakenSeconds: totalTimeSpentSeconds,
    avgTimePerQuestion,
    accuracyByDifficulty,
    accuracyByTopic,
    fastestQuestionId: fastestId,
    slowestQuestionId: slowestId,
    flaggedCount,
    unansweredCount,
    userAnswers,
  };
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
