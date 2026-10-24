import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser with 20mb limit for large study materials
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Initialize Google GenAI client server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Resilient wrapper with exponential backoff for high-demand spikes
async function generateWithRetry(params: any, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      const errMsg = err?.message || '';
      const isTransient =
        err?.status === 503 ||
        err?.status === 429 ||
        errMsg.includes('503') ||
        errMsg.includes('429') ||
        errMsg.includes('high demand') ||
        errMsg.includes('UNAVAILABLE');

      if (isTransient && attempt < maxRetries) {
        console.warn(`Transient high demand on attempt ${attempt + 1}, retrying in ${(attempt + 1) * 800}ms...`);
        await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 800));
        continue;
      }
      throw err;
    }
  }
}

// Endpoint: Generate Timed Mock Test from study material
app.post('/api/generate-quiz', async (req: Request, res: Response) => {
  try {
    const {
      materialText = '',
      fileBase64,
      fileMimeType = 'application/pdf',
      numQuestions = 10,
      difficulty = 'adaptive',
      mode = 'synthesis',
      customInstructions = '',
    } = req.body;

    const hasText = typeof materialText === 'string' && materialText.trim().length > 0;
    const hasFile = typeof fileBase64 === 'string' && fileBase64.length > 20;

    if (!hasText && !hasFile) {
      return res.status(400).json({ error: 'Please provide study material, document text, or upload a file.' });
    }

    const isAutoCount = numQuestions === 'auto' || numQuestions === 'all' || !numQuestions;
    const questionCount = isAutoCount ? 0 : Math.min(Math.max(Number(numQuestions) || 10, 1), 35);

    // Truncate safely to ~80,000 characters to keep latency ultra-low and space optimal
    const cleanedText = materialText.slice(0, 80000);

    let difficultyDirective = '';
    if (difficulty === 'easy') {
      difficultyDirective = 'All questions should be Easy difficulty: direct conceptual recall, clear terminology, fundamental definitions, and straightforward facts.';
    } else if (difficulty === 'medium') {
      difficultyDirective = 'All questions should be Medium difficulty: conceptual application, comparison between principles, scenario comprehension, and analytical reasoning.';
    } else if (difficulty === 'hard') {
      difficultyDirective = 'All questions should be Hard difficulty: multi-step deductive problem solving, edge-case analysis, subtle distractors, and tricky application scenarios.';
    } else if (difficulty === 'adaptive') {
      difficultyDirective = `Structure the questions in an adaptive progressive ladder: first ~30% are Easy (foundations), middle ~40% are Medium (application), and final ~30% are Hard (advanced synthesis & evaluation).`;
    } else {
      difficultyDirective = 'Match the difficulty level found naturally within the provided material.';
    }

    let modeDirective = '';
    if (mode === 'exact_extract') {
      modeDirective = `If the provided material already contains practice questions, quiz problems, or exercises, extract and standardize them directly into the output schema. If insufficient existing questions are found, create questions strictly faithful to the text facts.`;
    } else {
      modeDirective = `Synthesize fresh, original, high-yield examination questions designed to rigorously test a student's true understanding of the core topics and nuances in the text.`;
    }

    const countGuideline = isAutoCount
      ? `1. Extract/generate ALL questions from the given material. If the material contains specific practice questions, exercises, or exam problems, extract and convert EVERY SINGLE question found in the material (matching the exact number of questions present). If the material is conceptual notes, generate high-yield questions covering every key topic.`
      : `1. Generate EXACTLY ${questionCount} questions.`;

    const systemPrompt = `You are a world-class examination architect specializing in timed competitive exams.
Your mission is to generate a high-yield timed mock test based ONLY on the provided study material.

Guidelines:
${countGuideline}
2. Every question must have EXACTLY 4 distinct, plausible options.
3. Only ONE option must be clearly correct. The 3 distractors must be realistic.
4. "correct_answer_index" must be an integer (0, 1, 2, or 3) indicating the exact 0-indexed position in the "options" array.
5. Provide a concise, clear explanation (1-2 sentences) of why the correct option is right. Keep it focused and fast to read.
6. Provide a concise 1-sentence "key_takeaway" memory anchor.
7. Assign an accurate "difficulty" ('easy', 'medium', or 'hard') and a relevant sub-"topic" to each question.
8. Strictly follow the JSON output schema. Return valid JSON only.`;

    const contentParts: any[] = [];
    if (hasFile) {
      contentParts.push({
        inlineData: {
          mimeType: fileMimeType,
          data: fileBase64,
        },
      });
    }

    let promptText = '';
    if (hasText) {
      promptText += `STUDY MATERIAL CONTEXT:\n${cleanedText}\n\n`;
    } else {
      promptText += `STUDY MATERIAL CONTEXT: [The study material is in the attached document above.]\n\n`;
    }

    promptText += `EXAM SPECIFICATIONS:
- Number of Questions: ${isAutoCount ? 'All questions present in material' : `${questionCount} questions`}
- Difficulty Setting: ${difficulty} (${difficultyDirective})
- Generation Mode: ${mode} (${modeDirective})
${customInstructions ? `- Additional User Focus: ${customInstructions}` : ''}

Generate the complete mock test JSON now:`;

    contentParts.push({ text: promptText });

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: { parts: contentParts },
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            test_title: {
              type: Type.STRING,
              description: 'A professional, concise title for this mock examination.',
            },
            topic: {
              type: Type.STRING,
              description: 'Primary subject domain (e.g., Computer Science, Biochemistry, Macroeconomics).',
            },
            difficulty_level: {
              type: Type.STRING,
              description: 'Overall exam difficulty profile.',
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING, description: 'The question stem or problem statement.' },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Exactly 4 multiple choice options.',
                  },
                  correct_answer_index: {
                    type: Type.INTEGER,
                    description: '0-based index of the correct option (0, 1, 2, or 3).',
                  },
                  difficulty: {
                    type: Type.STRING,
                    description: 'Question difficulty: easy, medium, or hard.',
                  },
                  topic: {
                    type: Type.STRING,
                    description: 'Sub-topic or concept tested.',
                  },
                  explanation: {
                    type: Type.STRING,
                    description: 'Thorough conceptual breakdown of the solution.',
                  },
                  key_takeaway: {
                    type: Type.STRING,
                    description: 'Single high-yield rule or memory anchor.',
                  },
                },
                required: [
                  'id',
                  'question',
                  'options',
                  'correct_answer_index',
                  'difficulty',
                  'topic',
                  'explanation',
                  'key_takeaway',
                ],
              },
            },
          },
          required: ['test_title', 'topic', 'difficulty_level', 'questions'],
        },
      },
    });

    const responseText = response.text?.trim() || '{}';
    const parsedData = JSON.parse(responseText);

    // Validate questions array
    if (!parsedData.questions || !Array.isArray(parsedData.questions) || parsedData.questions.length === 0) {
      throw new Error('No questions could be generated from the given context.');
    }

    // Format & normalize IDs and bounds
    parsedData.questions = parsedData.questions.map((q: any, idx: number) => ({
      ...q,
      id: idx + 1,
      correct_answer_index: Math.min(Math.max(Number(q.correct_answer_index) || 0, 0), (q.options?.length || 4) - 1),
      difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty?.toLowerCase()) ? q.difficulty.toLowerCase() : 'medium',
    }));

    return res.json({
      success: true,
      quiz: parsedData,
    });
  } catch (err: any) {
    console.error('Quiz generation error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate mock test. Please check the provided material and try again.',
    });
  }
});

// Endpoint: Deep Performance & Diagnostic Tutor Analysis
app.post('/api/analyze-performance', async (req: Request, res: Response) => {
  try {
    const {
      testTitle,
      score,
      total,
      timeSpentSeconds,
      resultsBreakdown,
    } = req.body;

    const percentage = Math.round((score / Math.max(total, 1)) * 100);

    const prompt = `Student Test Results for Exam: "${testTitle || 'Mock Test'}"
Score: ${score} / ${total} (${percentage}%)
Time Spent: ${timeSpentSeconds} seconds (Avg ${(timeSpentSeconds / Math.max(total, 1)).toFixed(1)}s per question)

Question Breakdown Summary:
${JSON.stringify(resultsBreakdown, null, 2)}

Provide a sharp, pedagogical diagnostic review for this student.
Identify exact patterns in where they slipped, pinpoint foundational vs application gaps, and give actionable remedial advice.`;

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are an expert cognitive exam tutor. Analyze student mock test results and return JSON with diagnostic insights, weak subtopics, and a prioritized study roadmap.`,
        temperature: 0.4,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING, description: 'Short 2-3 word performance badge e.g. "Commanding Mastery", "Solid Foundation", "Critical Review Required".' },
            overall_critique: { type: Type.STRING, description: 'Concise 2-3 sentence assessment of accuracy, pacing, and retention.' },
            mastered_topics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of concepts the student showed solid command over.',
            },
            priority_weak_areas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  concept: { type: Type.STRING },
                  observation: { type: Type.STRING },
                  fix_action: { type: Type.STRING },
                },
                required: ['concept', 'observation', 'fix_action'],
              },
            },
            time_management_feedback: { type: Type.STRING, description: 'Feedback on their speed and pacing.' },
            quick_study_roadmap: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 concrete steps to close score gaps before test day.',
            },
          },
          required: [
            'verdict',
            'overall_critique',
            'mastered_topics',
            'priority_weak_areas',
            'time_management_feedback',
            'quick_study_roadmap',
          ],
        },
      },
    });

    const responseText = response.text?.trim() || '{}';
    const analysis = JSON.parse(responseText);

    return res.json({ success: true, analysis });
  } catch (err: any) {
    console.error('Performance analysis error:', err);
    return res.status(500).json({
      error: 'Failed to generate deep AI analysis. Basic metrics are still available.',
    });
  }
});

// Setup Vite middlewares in development or static serve in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`QuickQuiz AI Server running on port ${PORT}`);
  });
}

startServer();
